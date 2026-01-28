using Microsoft.AspNetCore.Mvc;
using ElectronicsEcommerce.API.DTOs;

namespace ElectronicsEcommerce.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatBotController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;

        public ChatBotController(IConfiguration configuration, IHttpClientFactory httpClientFactory)
        {
            _configuration = configuration;
            _httpClient = httpClientFactory.CreateClient();
        }

        [HttpPost("ask")]
        public async Task<ActionResult<ChatResponse>> AskQuestion([FromBody] ChatRequest request)
        {
            var apiKey = _configuration["OpenAI:ApiKey"];

            // If no API key, use mock responses
            if (string.IsNullOrEmpty(apiKey))
            {
                return GetMockResponse(request.Message);
            }

            try
            {
                // Prepare the request
                var openAiRequest = new
                {
                    model = "gpt-3.5-turbo",
                    messages = new[]
                    {
                        new { role = "system", content = GetSystemPrompt() },
                        new { role = "user", content = request.Message }
                    },
                    max_tokens = 300,
                    temperature = 0.7
                };

                var json = System.Text.Json.JsonSerializer.Serialize(openAiRequest);
                var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");

                // Set headers
                _httpClient.DefaultRequestHeaders.Authorization =
                    new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", apiKey);
                _httpClient.DefaultRequestHeaders.Add("OpenAI-Organization", _configuration["OpenAI:Organization"]);

                // Send request
                var response = await _httpClient.PostAsync(
                    "https://api.openai.com/v1/chat/completions",
                    content);

                if (response.IsSuccessStatusCode)
                {
                    var responseJson = await response.Content.ReadAsStringAsync();
                    using var doc = System.Text.Json.JsonDocument.Parse(responseJson);
                    var answer = doc.RootElement
                        .GetProperty("choices")[0]
                        .GetProperty("message")
                        .GetProperty("content")
                        .GetString() ?? "No response generated.";

                    return new ChatResponse
                    {
                        Answer = answer,
                        Timestamp = DateTime.UtcNow,
                        IsAI = true
                    };
                }
                else
                {
                    // Fallback to mock response
                    return GetMockResponse(request.Message);
                }
            }
            catch
            {
                // Fallback to mock response
                return GetMockResponse(request.Message);
            }
        }

        private string GetSystemPrompt()
        {
            return @"You are ElectroBot, a helpful assistant for an electronics e-commerce website.
                    Help users with:
                    1. Product recommendations for smartphones, laptops, tablets
                    2. Technical specifications explanation
                    3. Comparison between different products
                    4. General electronics shopping advice
                    5. Suggest reputable websites for more info (like manufacturer sites, tech review sites)
                    
                    Be friendly, concise, and helpful. Keep responses under 3 sentences.";
        }

        private ActionResult<ChatResponse> GetMockResponse(string message)
        {
            message = message.ToLower();

            var response = message switch
            {
                string s when s.Contains("hello") || s.Contains("hi") =>
                    "Hello! I'm ElectroBot. How can I help you with electronics today?",

                string s when s.Contains("smartphone") || s.Contains("phone") =>
                    "We have great smartphones from Apple, Samsung, and Google. " +
                    "Check out our smartphones category for the latest models with detailed specifications!",

                string s when s.Contains("laptop") =>
                    "We offer laptops from Apple, Dell, HP for work, gaming, and creativity. " +
                    "What's your budget and primary use? I can recommend the best options!",

                string s when s.Contains("compare") =>
                    "Use our product comparison tool to compare 2 products side by side! " +
                    "You can compare specifications, prices, and features easily.",

                string s when s.Contains("price") || s.Contains("cost") =>
                    "Prices vary by product. You can check individual product pages for exact pricing. " +
                    "We also have seasonal discounts and bundle offers!",

                string s when s.Contains("delivery") || s.Contains("shipping") =>
                    "We offer standard shipping (3-5 days) and express delivery (1-2 days). " +
                    "Free shipping on orders above $199!",

                string s when s.Contains("thank") || s.Contains("thanks") =>
                    "You're welcome! Let me know if you need any more help with electronics.",

                _ => "I'm here to help with electronics! You can ask me about products, " +
                     "comparisons, recommendations, or technical specifications. What specifically interests you?"
            };

            return new ChatResponse
            {
                Answer = response,
                Timestamp = DateTime.UtcNow,
                IsAI = false
            };
        }
    }
}