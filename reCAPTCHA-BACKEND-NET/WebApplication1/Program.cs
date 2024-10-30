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
    var username = System.Text.Json.JsonDocument.Parse(body).RootElement.GetProperty("username").GetString();

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
            Endpoints = { new EndpointVerificationInfo { EmailAddress = username } }
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
})
    .WithName("reCAPTCHA")
.WithOpenApi();

// Endpoint de verificación del verdictToken
app.MapPost("/verify-verdict", async (HttpContext context, RecaptchaEnterpriseServiceClient recaptchaClient) =>
{
    var recaptchaConfig = builder.Configuration.GetSection("Recaptcha");
    var projectId = recaptchaConfig["ProjectId"];
    var siteKey = recaptchaConfig["SiteKey"];
    // Obtener el verdictToken enviado desde el frontend
    var requestBody = await context.Request.ReadFromJsonAsync<VerificationRequest>();

    if (requestBody is null || string.IsNullOrEmpty(requestBody.VerdictToken))
    {
        return Results.BadRequest(new { message = "Token no válido o ausente" });
    }

    // ID del proyecto en Google Cloud donde está configurado reCAPTCHA Enterprise

    // Crear una solicitud de evaluación para verificar el token
    var assessmentRequest = new CreateAssessmentRequest
    {
        Parent = $"projects/{projectId}",
        Assessment = new Assessment
        {
            Event = new Event
            {
                Token = requestBody.VerdictToken,
                SiteKey = siteKey // Clave de tu sitio de reCAPTCHA configurada en Google Cloud
            }
        }
    };

    // Intentar crear la evaluación
    try
    {
        var response = await recaptchaClient.CreateAssessmentAsync(assessmentRequest);
        Console.WriteLine(System.Text.Json.JsonSerializer.Serialize(response));
        // Verificar si el token es válido y si la evaluación determina que es legítima
        if (response.TokenProperties.Valid && response.RiskAnalysis.Score >= 0.5)
        {
            return Results.Ok(new { isValid = true, message = "Token válido" });
        }
        else
        {
            return Results.Ok(new { isValid = false, message = "Token inválido o bajo nivel de confianza" });
        }
    }
    catch (Exception ex)
    {
        return Results.StatusCode(500);
    }
});

app.Run();

// Modelo para recibir el token del frontend
public record VerificationRequest(string VerdictToken);
