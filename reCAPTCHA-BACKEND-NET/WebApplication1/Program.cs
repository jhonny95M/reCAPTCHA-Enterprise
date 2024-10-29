using dotenv.net;
using Google.Cloud.RecaptchaEnterprise.V1;
using Microsoft.Extensions.DependencyInjection;
using System.Net.Mail;

var builder = WebApplication.CreateBuilder(args);

DotEnv.Load();
// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
// Configura CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});
// Configura el cliente RecaptchaEnterpriseServiceClient como un servicio singleton
builder.Services.AddSingleton<RecaptchaEnterpriseServiceClient>(sp =>
{
    var credentialsPath = Environment.GetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS");
    return new RecaptchaEnterpriseServiceClientBuilder
    {
        CredentialsPath = credentialsPath
    }.Build();
});

var app = builder.Build();

// Habilita CORS
app.UseCors();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast = Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast")
.WithOpenApi();
app.MapPost("/verify-recaptcha", async (HttpRequest request, RecaptchaEnterpriseServiceClient recaptchaClient) =>
{
    var recaptchaConfig = builder.Configuration.GetSection("Recaptcha");
    var projectId = recaptchaConfig["ProjectId"];
    var siteKey = recaptchaConfig["SiteKey"];
    var accountId = recaptchaConfig["AccountId"];
    var emailAddress = recaptchaConfig["EmailAddress"];

    using var reader = new StreamReader(request.Body);
    var body = await reader.ReadToEndAsync();
    var token = System.Text.Json.JsonDocument.Parse(body).RootElement.GetProperty("token").GetString();

    // Configura la solicitud de evaluación
    var assesName = AssessmentName.FromProjectAssessment(projectId, token);
    var assessment = new Assessment
    {
        Event = new Event
        {
            Token = token,
            SiteKey = siteKey,
            UserInfo = new UserInfo
            {
                AccountId = accountId
            }
        },
        AccountVerification = new AccountVerificationInfo
        {
            Endpoints = { new EndpointVerificationInfo { EmailAddress = emailAddress } }
        }
    };
    var requestAssessment = new CreateAssessmentRequest
    {
        Parent = $"projects/{projectId}",
        Assessment = assessment
    };
    try
    {
        var response = await recaptchaClient.CreateAssessmentAsync(requestAssessment);
        var tokenProperties = response.TokenProperties;
        var riskAnalysis = response.RiskAnalysis;

        if (tokenProperties?.Valid == true && riskAnalysis?.Score >= 0.5)
        {
            return Results.Ok(new { success = true, response });
        }
        else
        {
            return Results.BadRequest(new { success = false });
        }
    }
    catch (Exception ex)
    {
        Console.Error.WriteLine(ex);
        return Results.StatusCode(500);
    }
}).WithName("reCAPTCHA")
.WithOpenApi();
app.Run();

internal record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
