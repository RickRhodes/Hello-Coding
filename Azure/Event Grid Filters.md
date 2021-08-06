# Storgae Filters


https://docs.microsoft.com/en-us/azure/storage/blobs/storage-blob-event-overview


To learn more about how to apply filters, see Filter events for Event Grid.

To match all events for a storage account, you can leave the subject filters empty.

The subject of Blob storage events uses the format:
/blobServices/default/containers//blobs/

To match events from blobs created in a set of containers sharing a prefix, use a subjectBeginsWith filter like:
/blobServices/default/containers/containerprefix

To match events from blobs created in specific container, use a subjectBeginsWith filter like:
/blobServices/default/containers/containername/

To match events from blobs created in specific container sharing a blob name prefix, use a subjectBeginsWith filter like:
/blobServices/default/containers/containername/blobs/blobprefix

To match events from blobs created in specific container sharing a blob suffix, use a subjectEndsWith filter like “.log” or “.jpg”.

For more information, see Event Grid Concepts.



