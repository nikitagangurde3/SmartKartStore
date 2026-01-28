namespace ElectronicsEcommerce.API.DTOs
{
    public class ChatRequest
    {
        public string Message { get; set; } = string.Empty;
    }

    public class ChatResponse
    {
        public string Answer { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public bool IsAI { get; set; }
        public List<string> SuggestedQuestions { get; set; } = new List<string>
        {
            "What's the best smartphone under Rs.15000?",
            "Compare iPhone and Samsung Galaxy",
            "Which laptop is best for programming?",
            "Tell me about gaming laptops",
            "What tablets do you recommend?"
        };
    }
}