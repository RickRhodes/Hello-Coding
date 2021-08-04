# Dynamic Binding in Azure Functions with Imperative Runtime Bindings

http://dontcodetired.com/blog/post/Dynamic-Binding-in-Azure-Functions-with-Imperative-Runtime-Bindings



# Using Event Grid to Respond to New Blobs

http://dontcodetired.com/blog/post/Improving-Azure-Functions-Blob-Trigger-Performance-and-Reliability-Part-3-Using-Event-Grid-to-Respond-to-New-Blobs


Creating an Event Grid Triggered Function
The following Azure Function code is a modified version of the code used in the previous article:

```c#
public static class ProcessFoodBlobsEventGrid
{
    private static readonly string[] _meats = { "steak", "chicken", "venison" };
 
    [FunctionName("ProcessFoodBlobsEventGrid")]
    public static void Run(
     [EventGridTrigger]EventGridEvent blobCreatedEvent,
     [Blob("{data.url}")] string foods, // assumes small blob size so using string not stream
     [Blob("{data.url}.vegetarian")] out string vegetarian,
     [Blob("{data.url}.nonvegetarian")] out string nonVegetarian,
     ILogger log)
    {
        log.LogInformation("Processing a blob created event");
 
        StorageBlobCreatedEventData createdEvent = ((JObject)blobCreatedEvent.Data).ToObject<StorageBlobCreatedEventData>();
 
        log.LogInformation($"Blob: {createdEvent.Url}");
        log.LogInformation($"Api operation: {createdEvent.Api}");
 
        vegetarian = null;
        nonVegetarian = null;
 
        string[] foodLines = foods.Split(new[] { "\r\n", "\n" }, StringSplitOptions.RemoveEmptyEntries);
 
 
        foreach (var food in foodLines)
        {
            var isMeat = _meats.Contains(food);
 
            if (isMeat)
            {
                nonVegetarian += food + Environment.NewLine;
            }
            else
            {
                vegetarian += food + Environment.NewLine;
            }
        }
    }
}
```
