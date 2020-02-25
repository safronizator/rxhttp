/**
 * HTTP methods
 */
export enum Method {
    Delete = "DELETE",
    Get = "GET",
    Head = "HEAD",
    Options = "OPTIONS",
    Patch = "PATCH",
    Post = "POST",
    Put = "PUT"
}


/**
 * Hypertext Transfer Protocol (HTTP) response status codes.
 *
 * @see {@link https://en.wikipedia.org/wiki/List_of_HTTP_status_codes}
 */
export enum StatusCode {

    /**
     * The server has received the request headers and the client should proceed to send the request body
     * (in the case of a request for which a body needs to be sent; for example, a POST request).
     * Sending a large request body to a server after a request has been rejected for inappropriate headers would be inefficient.
     * To have a server check the request's headers, a client must send Expect: 100-continue as a header in its initial request
     * and receive a 100 Continue status code in response before sending the body. The response 417 Expectation Failed indicates the request should not be continued.
     */
    Continue = 100,

    /**
     * The requester has asked the server to switch protocols and the server has agreed to do so.
     */
    SwitchingProtocols = 101,

    /**
     * A WebDAV request may contain many sub-requests involving file operations, requiring a long time to complete the request.
     * This code indicates that the server has received and is processing the request, but no response is available yet.
     * This prevents the client from timing out and assuming the request was lost.
     */
    Processing = 102,

    /**
     * Standard response for successful HTTP requests.
     * The actual response will depend on the request method used.
     * In a GET request, the response will contain an entity corresponding to the requested resource.
     * In a POST request, the response will contain an entity describing or containing the result of the action.
     */
    Ok = 200,

    /**
     * The request has been fulfilled, resulting in the creation of a new resource.
     */
    Created = 201,

    /**
     * The request has been accepted for processing, but the processing has not been completed.
     * The request might or might not be eventually acted upon, and may be disallowed when processing occurs.
     */
    Accepted = 202,

    /**
     * SINCE HTTP/1.1
     * The server is a transforming proxy that received a 200 OK from its origin,
     * but is returning a modified version of the origin's response.
     */
    NonAuthoritativeInformation = 203,

    /**
     * The server successfully processed the request and is not returning any content.
     */
    NoContent = 204,

    /**
     * The server successfully processed the request, but is not returning any content.
     * Unlike a 204 response, this response requires that the requester reset the document view.
     */
    ResetContent = 205,

    /**
     * The server is delivering only part of the resource (byte serving) due to a range header sent by the client.
     * The range header is used by HTTP clients to enable resuming of interrupted downloads,
     * or split a download into multiple simultaneous streams.
     */
    PartialContent = 206,

    /**
     * The message body that follows is an XML message and can contain a number of separate response codes,
     * depending on how many sub-requests were made.
     */
    MultiStatus = 207,

    /**
     * The members of a DAV binding have already been enumerated in a preceding part of the (multistatus) response,
     * and are not being included again.
     */
    AlreadyReported = 208,

    /**
     * The server has fulfilled a request for the resource,
     * and the response is a representation of the result of one or more instance-manipulations applied to the current instance.
     */
    ImUsed = 226,

    /**
     * Indicates multiple options for the resource from which the client may choose (via agent-driven content negotiation).
     * For example, this code could be used to present multiple video format options,
     * to list files with different filename extensions, or to suggest word-sense disambiguation.
     */
    MultipleChoices = 300,

    /**
     * This and all future requests should be directed to the given URI.
     */
    MovedPermanently = 301,

    /**
     * This is an example of industry practice contradicting the standard.
     * The HTTP/1.0 specification (RFC 1945) required the client to perform a temporary redirect
     * (the original describing phrase was "Moved Temporarily"), but popular browsers implemented 302
     * with the functionality of a 303 See Other. Therefore, HTTP/1.1 added status codes 303 and 307
     * to distinguish between the two behaviours. However, some Web applications and frameworks
     * use the 302 status code as if it were the 303.
     */
    Found = 302,

    /**
     * SINCE HTTP/1.1
     * The response to the request can be found under another URI using a GET method.
     * When received in response to a POST (or PUT/DELETE), the client should presume that
     * the server has received the data and should issue a redirect with a separate GET message.
     */
    SeeOther = 303,

    /**
     * Indicates that the resource has not been modified since the version specified by the request headers If-Modified-Since or If-None-Match.
     * In such case, there is no need to retransmit the resource since the client still has a previously-downloaded copy.
     */
    NotModified = 304,

    /**
     * SINCE HTTP/1.1
     * The requested resource is available only through a proxy, the address for which is provided in the response.
     * Many HTTP clients (such as Mozilla and Internet Explorer) do not correctly handle responses with this status code, primarily for security reasons.
     */
    UseProxy = 305,

    /**
     * No longer used. Originally meant "Subsequent requests should use the specified proxy."
     */
    SwitchProxy = 306,

    /**
     * SINCE HTTP/1.1
     * In this case, the request should be repeated with another URI; however, future requests should still use the original URI.
     * In contrast to how 302 was historically implemented, the request method is not allowed to be changed when reissuing the original request.
     * For example, a POST request should be repeated using another POST request.
     */
    TemporaryRedirect = 307,

    /**
     * The request and all future requests should be repeated using another URI.
     * 307 and 308 parallel the behaviors of 302 and 301, but do not allow the HTTP method to change.
     * So, for example, submitting a form to a permanently redirected resource may continue smoothly.
     */
    PermanentRedirect = 308,

    /**
     * The server cannot or will not process the request due to an apparent client error
     * (e.g., malformed request syntax, too large size, invalid request message framing, or deceptive request routing).
     */
    BadRequest = 400,

    /**
     * Similar to 403 Forbidden, but specifically for use when authentication is required and has failed or has not yet
     * been provided. The response must include a WWW-Authenticate header field containing a challenge applicable to the
     * requested resource. See Basic access authentication and Digest access authentication. 401 semantically means
     * "unauthenticated",i.e. the user does not have the necessary credentials.
     */
    Unauthorized = 401,

    /**
     * Reserved for future use. The original intention was that this code might be used as part of some form of digital
     * cash or micro payment scheme, but that has not happened, and this code is not usually used.
     * Google Developers API uses this status if a particular developer has exceeded the daily limit on requests.
     */
    PaymentRequired = 402,

    /**
     * The request was valid, but the server is refusing action.
     * The user might not have the necessary permissions for a resource.
     */
    Forbidden = 403,

    /**
     * The requested resource could not be found but may be available in the future.
     * Subsequent requests by the client are permissible.
     */
    NotFound = 404,

    /**
     * A request method is not supported for the requested resource;
     * for example, a GET request on a form that requires data to be presented via POST, or a PUT request on a read-only resource.
     */
    MethodNotAllowed = 405,

    /**
     * The requested resource is capable of generating only content not acceptable according to the Accept headers sent in the request.
     */
    NotAcceptable = 406,

    /**
     * The client must first authenticate itself with the proxy.
     */
    ProxyAuthenticationRequired = 407,

    /**
     * The server timed out waiting for the request.
     * According to HTTP specifications:
     * "The client did not produce a request within the time that the server was prepared to wait. The client MAY repeat the request without modifications at any later time."
     */
    RequestTimeout = 408,

    /**
     * Indicates that the request could not be processed because of conflict in the request,
     * such as an edit conflict between multiple simultaneous updates.
     */
    Conflict = 409,

    /**
     * Indicates that the resource requested is no longer available and will not be available again.
     * This should be used when a resource has been intentionally removed and the resource should be purged.
     * Upon receiving a 410 status code, the client should not request the resource in the future.
     * Clients such as search engines should remove the resource from their indices.
     * Most use cases do not require clients and search engines to purge the resource, and a "404 Not Found" may be used instead.
     */
    Gone = 410,

    /**
     * The request did not specify the length of its content, which is required by the requested resource.
     */
    LengthRequired = 411,

    /**
     * The server does not meet one of the preconditions that the requester put on the request.
     */
    PreconditionFailed = 412,

    /**
     * The request is larger than the server is willing or able to process. Previously called "Request Entity Too Large".
     */
    PayloadTooLarge = 413,

    /**
     * The URI provided was too long for the server to process. Often the result of too much data being encoded as a query-string of a GET request,
     * in which case it should be converted to a POST request.
     * Called "Request-URI Too Long" previously.
     */
    UriTooLong = 414,

    /**
     * The request entity has a media type which the server or resource does not support.
     * For example, the client uploads an image as image/svg+xml, but the server requires that images use a different format.
     */
    UnsupportedMediaType = 415,

    /**
     * The client has asked for a portion of the file (byte serving), but the server cannot supply that portion.
     * For example, if the client asked for a part of the file that lies beyond the end of the file.
     * Called "Requested Range Not Satisfiable" previously.
     */
    RangeNotSatisfiable = 416,

    /**
     * The server cannot meet the requirements of the Expect request-header field.
     */
    ExpectationFailed = 417,

    /**
     * This code was defined in 1998 as one of the traditional IETF April Fools' jokes, in RFC 2324, Hyper Text Coffee Pot Control Protocol,
     * and is not expected to be implemented by actual HTTP servers. The RFC specifies this code should be returned by
     * teapots requested to brew coffee. This HTTP status is used as an Easter egg in some websites, including Google.com.
     */
    IAmATeapot = 418,

    /**
     * The request was directed at a server that is not able to produce a response (for example because a connection reuse).
     */
    MisdirectedRequest = 421,

    /**
     * The request was well-formed but was unable to be followed due to semantic errors.
     */
    UnprocessableEntity = 422,

    /**
     * The resource that is being accessed is locked.
     */
    Locked = 423,

    /**
     * The request failed due to failure of a previous request (e.g., a PROPPATCH).
     */
    FailedDependency = 424,

    /**
     * The client should switch to a different protocol such as TLS/1.0, given in the Upgrade header field.
     */
    UpgradeRequired = 426,

    /**
     * The origin server requires the request to be conditional.
     * Intended to prevent "the 'lost update' problem, where a client
     * GETs a resource's state, modifies it, and PUTs it back to the server,
     * when meanwhile a third party has modified the state on the server, leading to a conflict."
     */
    PreconditionRequired = 428,

    /**
     * The user has sent too many requests in a given amount of time. Intended for use with rate-limiting schemes.
     */
    TooManyRequests = 429,

    /**
     * The server is unwilling to process the request because either an individual header field,
     * or all the header fields collectively, are too large.
     */
    RequestHeaderFieldsTooLarge = 431,

    /**
     * A server operator has received a legal demand to deny access to a resource or to a set of resources
     * that includes the requested resource. The code 451 was chosen as a reference to the novel Fahrenheit 451.
     */
    UnavailableForLegalReasons = 451,

    /**
     * A generic error message, given when an unexpected condition was encountered and no more specific message is suitable.
     */
    InternalServerError = 500,

    /**
     * The server either does not recognize the request method, or it lacks the ability to fulfill the request.
     * Usually this implies future availability (e.g., a new feature of a web-service API).
     */
    NotImplemented = 501,

    /**
     * The server was acting as a gateway or proxy and received an invalid response from the upstream server.
     */
    BadGateway = 502,

    /**
     * The server is currently unavailable (because it is overloaded or down for maintenance).
     * Generally, this is a temporary state.
     */
    ServiceUnavailable = 503,

    /**
     * The server was acting as a gateway or proxy and did not receive a timely response from the upstream server.
     */
    GatewayTimeout = 504,

    /**
     * The server does not support the HTTP protocol version used in the request
     */
    HttpVersionNotSupported = 505,

    /**
     * Transparent content negotiation for the request results in a circular reference.
     */
    VariantAlsoNegotiates = 506,

    /**
     * The server is unable to store the representation needed to complete the request.
     */
    InsufficientStorage = 507,

    /**
     * The server detected an infinite loop while processing the request.
     */
    LoopDetected = 508,

    /**
     * Further extensions to the request are required for the server to fulfill it.
     */
    NotExtended = 510,

    /**
     * The client needs to authenticate to gain network access.
     * Intended for use by intercepting proxies used to control access to the network (e.g., "captive portals" used
     * to require agreement to Terms of Service before granting full Internet access via a Wi-Fi hotspot).
     */
    NetworkAuthenticationRequired = 511,
}


export enum RequestHeader {
    /**
     * Content-Types that are acceptable for the response. See Content negotiation. Permanent.
     * Examples:
     * <code>Accept: text/plain</code>
     * @type {String}
     */
    ACCEPT = 'Accept',

    /**
     * Character sets that are acceptable. Permanent.
     * Examples:
     * <code>Accept-Charset: utf-8</code>
     * @type {String}
     */
    ACCEPT_CHARSET = 'Accept-Charset',

    /**
     * List of acceptable encodings. See HTTP compression. Permanent.
     * Examples:
     * <code>Accept-Encoding: gzip, deflate</code>
     * @type {String}
     */
    ACCEPT_ENCODING = 'Accept-Encoding',

    /**
     * List of acceptable human languages for response. See Content negotiation. Permanent.
     * Examples:
     * <code>Accept-Language: en-US</code>
     * @type {String}
     */
    ACCEPT_LANGUAGE = 'Accept-Language',

    /**
     * Acceptable version in time. Provisional.
     * Examples:
     * <code>Accept-Datetime: Thu, 31 May 2007 20:35:00 GMT</code>
     * @type {String}
     */
    ACCEPT_DATETIME = 'Accept-Datetime',

    /**
     * Authentication credentials for HTTP authentication. Permanent.
     * Examples:
     * <code>Authorization: Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ==</code>
     * @type {String}
     */
    AUTHORIZATION = 'Authorization',

    /**
     * Used to specify directives that must be obeyed by all caching mechanisms along the request-response chain.
     * Permanent.
     * Examples:
     * <code>Cache-Control: no-cache</code>
     * @type {String}
     */
    CACHE_CONTROL = 'Cache-Control',

    /**
     * Control options for the current connection and list of hop-by-hop request fields. Permanent.
     * Examples:
     * <code>Connection: keep-alive</code>
     * <code>Connection: Upgrade</code>
     * @type {String}
     */
    CONNECTION = 'Connection',

    /**
     * An HTTP cookie previously sent by the server with Set-Cookie (below). Permanent: standard.
     * Examples:
     * <code>Cookie: $Version=1, Skin=new,</code>
     * @type {String}
     */
    COOKIE = 'Cookie',

    /**
     * The length of the request body in octets (8-bit bytes). Permanent.
     * Examples:
     * <code>Content-Length: 348</code>
     * @type {String}
     */
    CONTENT_LENGTH = 'Content-Length',

    /**
     * A Base64-encoded binary MD5 sum of the content of the request body. Obsolete.
     * Examples:
     * <code>Content-MD5: Q2hlY2sgSW50ZWdyaXR5IQ==</code>
     * @type {String}
     */
    CONTENT_MD5 = 'Content-MD5',

    /**
     * The MIME type of the body of the request (used with POST and PUT requests). Permanent.
     * <code>Content-Type: application/x-www-form-urlencoded</code>
     * @type {String}
     */
    CONTENT_TYPE = 'Content-Type',

    /**
     * The date and time that the message was sent (in "HTTP-date" format as defined by RFC 7231 Date/Time Formats).
     * Permanent.
     * Examples:
     * <code>Date: Tue, 15 Nov 1994 08:12:31 GMT</code>
     * @type {String}
     */
    DATE = 'Date',

    /**
     * Indicates that particular server behaviors are required by the client. Permanent.
     * Examples:
     * <code>Expect: 100-continue</code>
     * @type {String}
     */
    EXPECT = 'Expect',

    /**
     * The email address of the user making the request. Permanent.
     * Examples:
     * <code>From: user@example.com</code>
     * @type {String}
     */
    FROM = 'From',

    /**
     * The domain name of the server (for virtual hosting), and the TCP port number on which the server is listening. The
     * port number may be omitted if the port is the standard port for the service requested. Permanent. Mandatory since
     * HTTP/1.1.
     * Examples:
     * <code>Host: en.wikipedia.org:80</code>
     * <code>Host: en.wikipedia.org</code>
     * @type {String}
     */
    HOST = 'Host',

    /**
     * Only perform the action if the client supplied entity matches the same entity on the server. This is mainly for
     * methods like PUT to only update a resource if it has not been modified since the user last updated it. Permanent.
     * Examples:
     * <code>If-Match: "737060cd8c284d8af7ad3082f209582d"</code>
     * @type {String}
     */
    IF_MATCH = 'If-Match',

    /**
     * Allows a 304 Not Modified to be returned if content is unchanged. Permanent.
     * Examples:
     * <code>If-Modified-Since: Sat, 29 Oct 1994 19:43:31 GMT</code>
     * @type {String}
     */
    IF_MODIFIED_SINCE = 'If-Modified-Since',

    /**
     * Allows a 304 Not Modified to be returned if content is unchanged, see HTTP ETag. Permanent.
     * Examples:
     * <code>If-None-Match: "737060cd8c284d8af7ad3082f209582d"</code>
     * @type {String}
     */
    IF_NONE_MATCH = 'If-None-Match',

    /**
     * If the entity is unchanged, send me the part(s) that I am missing, otherwise, send me the entire new entity.
     * Permanent.
     * Examples:
     * <code>If-Range: "737060cd8c284d8af7ad3082f209582d"</code>
     * @type {String}
     */
    IF_RANGE = 'If-Range',

    /**
     * Only send the response if the entity has not been modified since a specific time. Permanent.
     * Examples:
     * <code>If-Unmodified-Since: Sat, 29 Oct 1994 19:43:31 GMT</code>
     * @type {String}
     */
    IF_UNMODIFIED_SINCE = 'If-Unmodified-Since',

    /**
     * Limit the number of times the message can be forwarded through proxies or gateways. Permanent.
     * Examples:
     * <code>Max-Forwards: 10</code>
     * @type {String}
     */
    MAX_FORWARDS = 'Max-Forwards',

    /**
     * Initiates a request for cross-origin resource sharing (asks server for an 'Access-Control-Allow-Origin' response
     * field). Permanent: standard.
     * Examples:
     * <code>Origin: http://www.example-social-network.com</code>
     * @type {String}
     */
    ORIGIN = 'Origin',

    /**
     * Implementation-specific fields that may have various effects anywhere along the request-response chain. Permanent.
     * Examples:
     * <code>Pragma: no-cache</code>
     * @type {String}
     */
    PRAGMA = 'Pragma',

    /**
     * Authorization credentials for connecting to a proxy. Permanent.
     * Examples:
     * <code>Proxy-Authorization: Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ==</code>
     * @type {String}
     */
    PROXY_AUTHORIZATION = 'Proxy-Authorization',

    /**
     * Request only part of an entity. Bytes are numbered from 0. See Byte serving. Permanent.
     * Examples:
     * <code>Range: bytes=500-999</code>
     * @type {String}
     */
    RANGE = 'Range',

    /**
     * This is the address of the previous web page from which a link to the currently requested page was followed. (The
     * word "referrer" has been misspelled in the RFC as well as in most implementations to the point that it has become
     * standard usage and is considered correct terminology). Permanent.
     * Examples:
     * <code>Referer: http://en.wikipedia.org/wiki/Main_Page</code>
     * @type {String}
     */
    REFERER = 'Referer',

    /**
     * The transfer encodings the user agent is willing to accept: the same values as for the response header field
     * Transfer-Encoding can be used, plus the "trailers" value (related to the "chunked" transfer method) to notify the
     * server it expects to receive additional fields in the trailer after the last, zero-sized, chunk. Permanent.
     * Examples:
     * <code>TE: trailers, deflate</code>
     * @type {String}
     */
    TE = 'TE',

    /**
     * The user agent string of the user agent. Permanent.
     * Examples:
     * <code>User-Agent: Mozilla/5.0 (X11, Linux x86_64, rv:12.0) Gecko/20100101 Firefox/21.0</code>
     * @type {String}
     */
    USER_AGENT = 'User-Agent',

    /**
     * Ask the server to upgrade to another protocol. Permanent.
     * Examples:
     * <code>Upgrade: HTTP/2.0, SHTTP/1.3, IRC/6.9, RTA/x11</code>
     * @type {String}
     */
    UPGRADE = 'Upgrade',

    /**
     * Informs the server of proxies through which the request was sent. Permanent.
     * Examples:
     * <code>Via: 1.0 fred, 1.1 example.com (Apache/1.1)</code>
     * @type {String}
     */
    VIA = 'Via',

    /**
     * A general warning about possible problems with the entity body. Permanent.
     * Examples:
     * <code>Warning: 199 Miscellaneous warning</code>
     * @type {String}
     */
    WARNING = 'Warning',

    /**
     * mainly used to identify Ajax requests. Most JavaScript frameworks send this field with value of XMLHttpRequest.
     * Examples:
     * <code>X-Requested-With: XMLHttpRequest</code>
     * @type {String}
     */
    X_REQUESTED_WITH = 'X-Requested-With',

    /**
     * Requests a web application to disable their tracking of a user. This is Mozilla's version of the X-Do-Not-Track
     * header field (since Firefox 4.0 Beta 11). Safari and IE9 also have support for this field. On March 7, 2011, a
     * draft proposal was submitted to IETF. The W3C Tracking Protection Working Group is producing a specification.
     * Examples:
     * <code>DNT: 1 (Do Not Track Enabled)</code>
     * <code>DNT: 0 (Do Not Track Disabled)</code>
     * @type {String}
     */
    DNT = 'DNT',

    /**
     * A de facto standard for identifying the originating IP address of a client connecting to a web server through an
     * HTTP proxy or load balancer.
     * Examples:
     * <code>X-Forwarded-For: client1, proxy1, proxy2</code>
     * <code>X-Forwarded-For: 129.78.138.66, 129.78.64.103</code>
     * @type {String}
     */
    X_FORWARDED_FOR = 'X-Forwarded-For',


    /**
     * A de facto standard for identifying the original host requested by the client in the Host HTTP request header, since
     * the host name and/or port of the reverse proxy (load balancer) may differ from the origin server handling the
     * request.
     * Examples:
     * <code>X-Forwarded-Host: en.wikipedia.org:80</code>
     * <code>X-Forwarded-Host: en.wikipedia.org</code>
     * @type {String}
     */
    X_FORWARDED_HOST = 'X-Forwarded-Host',

    /**
     * A de facto standard for identifying the originating protocol of an HTTP request, since a reverse proxy (load
     * balancer) may communicate with a web server using HTTP even if the request to the reverse proxy is HTTPS. An
     * alternative form of the header (X-ProxyUser-Ip) is used by Google clients talking to Google servers.
     * Examples:
     * <code>X-Forwarded-Proto: https</code>
     * @type {String}
     */
    X_FORWARDED_PROTO = 'X-Forwarded-Proto',

    /**
     * Non-standard header field used by Microsoft applications and load-balancers.
     * Examples:
     * <code>Front-End-Https: on</code>
     * @type {String}
     */
    FRONT_END_HTTPS = 'Front-End-Https',

    /**
     * Requests a web application override the method specified in the request (typically POST) with the method given in
     * the header field (typically PUT or DELETE). Can be used when a user agent or firewall prevents PUT or DELETE methods
     * from being sent directly (note that this either a bug in the software component, which ought to be fixed, or an
     * intentional configuration, in which case bypassing it may be the wrong thing to do).
     * Examples:
     * <code>X-HTTP-Method-Override: DELETE</code>
     * @type {String}
     */
    X_HTTP_METHOD_OVERRIDE = 'X-Http-Method-Override',

    /**
     * Allows easier parsing of the MakeModel/Firmware that is usually found in the User-Agent String of AT&T Devices.
     * Examples:
     * <code>X-Att-Deviceid: GT-P7320/P7320XXLPG</code>
     * @type {String}
     */
    X_ATT_DEVICEID = 'X-ATT-DeviceId',

    /**
     * Links to an XML file on the Internet with a full description and details about the device currently connecting. In the example to the right is an XML file for an AT&T Samsung Galaxy S2.    x-wap-profile: http://wap.samsungmobile.com/uaprof/SGH-I777.xml
     */
    X_WAP_PROFILE = 'X-Wap-Profile'
}


export enum ResponseHeader {

    /**
     * Implemented as a misunderstanding of the HTTP specifications. Common because of mistakes in implementations of early HTTP versions. Has exactly the same functionality as standard Connection field.    Proxy-Connection: keep-alive
     * @type {String}
     */
    PROXY_CONNECTION = 'Proxy-Connection',

    /**
     * Server-side deep packet insertion of a unique ID identifying customers of Verizon Wireless, also known as "perma-cookie" or "supercookie"    X-UIDH: ...
     */
    X_UIDH = 'X-UIDH',

    /**
     * Used to prevent cross-site request forgery. Alternative header names are: X-CSRFToken and X-XSRF-TOKEN    X-Csrf-Token: i8XNjC4b8KVok4uw5RftR38Wgp2BFwql
     */
    X_CSRF_TOKEN = 'X-Csrf-Token',

    /**
     * Specifying which web sites can participate in cross-origin resource sharing    Access-Control-Allow-Origin: *    Provisional
     */
    ACCESS_CONTROL_ALLOW_ORIGIN = 'Access-Control-Allow-Origin',

    /**
     * Specifies which patch document formats this server supports    Accept-Patch: text/example,charset=utf-8    Permanent
     */
    ACCEPT_PATCH = 'Accept-Patch',

    /**
     * What partial content range types this server supports via byte serving    Accept-Ranges: bytes    Permanent
     */
    ACCEPT_RANGES = 'Accept-Ranges',

    /**
     * The age the object has been in a proxy cache in seconds    Age: 12    Permanent
     */
    AGE = 'Age',

    /**
     * Valid actions for a specified resource. To be used for a 405 Method not allowed    Allow: GET, HEAD    Permanent
     */
    ALLOW = 'Allow',

    /**
     * Tells all caching mechanisms from server to client whether they may cache this object. It is measured in seconds    Cache-Control: max-age=3600    Permanent
     */
    CACHE_CONTROL = 'Cache-Control',

    /**
     * Control options for the current connection and list of hop-by-hop response fields    Connection: close    Permanent
     */
    CONNECTION = 'Connection',

    /**
     * An opportunity to raise a "File Download" dialogue box for a known MIME type with binary format or suggest a filename for dynamic content. Quotes are necessary with special characters.    Content-Disposition: attachment, filename="fname.ext"    Permanent
     */
    CONTENT_DISPOSITION = 'Content-Disposition',

    /**
     * The type of encoding used on the data. See HTTP compression.    Content-Encoding: gzip    Permanent
     */
    CONTENT_ENCODING = 'Content-Encoding',

    /**
     * The natural language or languages of the intended audience for the enclosed content    Content-Language: da    Permanent
     */
    CONTENT_LANGUAGE = 'Content-Language',

    /**
     * The length of the response body in octets (8-bit bytes)    Content-Length: 348    Permanent
     */
    CONTENT_LENGTH = 'Content-Length',

    /**
     * An alternate location for the returned data    Content-Location: /index.htm    Permanent
     */
    CONTENT_LOCATION = 'Content-Location',

    /**
     * A Base64-encoded binary MD5 sum of the content of the response    Content-MD5: Q2hlY2sgSW50ZWdyaXR5IQ==    Obsolete
     */
    CONTENT_MD5 = 'Content-MD5',

    /**
     * Where in a full body message this partial message belongs    Content-Range: bytes 21010-47021/47022    Permanent
     */
    CONTENT_RANGE = 'Content-Range',

    /**
     * The MIME type of this content    Content-Type: text/html, charset=utf-8    Permanent
     */
    CONTENT_TYPE = 'Content-Type',

    /**
     * The date and time that the message was sent (in "HTTP-date" format as defined by RFC 7231)    Date: Tue, 15 Nov 1994 08:12:31 GMT    Permanent
     */
    DATE = 'Date',

    /**
     * An identifier for a specific version of a resource, often a message digest    ETag: "737060cd8c284d8af7ad3082f209582d"    Permanent
     */
    ETAG = 'ETag',

    /**
     * Gives the date/time after which the response is considered stale (in "HTTP-date" format as defined by RFC 7231)    Expires: Thu, 01 Dec 1994 16:00:00 GMT    Permanent: standard
     */
    EXPIRES = 'Expires',

    /**
     * The last modified date for the requested object (in "HTTP-date" format as defined by RFC 7231)    Last-Modified: Tue, 15 Nov 1994 12:45:26 GMT    Permanent
     */
    LAST_MODIFIED = 'Last-Modified',

    /**
     * Used to express a typed relationship with another resource, where the relation type is defined by RFC 5988    Link: </feed>, rel="alternate"    Permanent
     */
    LINK = 'Link',

    /**
     * Used in redirection, or when a new resource has been created.    Location: http://www.w3.org/pub/WWW/People.html    Permanent
     */
    LOCATION = 'Location',

    /**
     * This field is supposed to set P3P policy, in the form of P3P:CP="your_compact_policy". However, P3P did not take off, most browsers have never fully implemented it, a lot of websites set this field with fake policy text, that was enough to fool browsers the existence of P3P policy and grant permissions for third party cookies.    P3P: CP="This is not a P3P policy! See http://www.google.com/support/accounts/bin/answer.py?hl=en&answer=151657 for more info."    Permanent
     * @type {string}
     */
    P3P = 'P3P',

    /**
     * Implementation-specific fields that may have various effects anywhere along the request-response chain.    Pragma: no-cache    Permanent
     */
    PRAGMA = 'Pragma',

    /**
     * Request authentication to access the proxy.    Proxy-Authenticate: Basic    Permanent
     */
    PROXY_AUTHENTICATION = 'Proxy-Authenticate',

    /**
     * HTTP Public Key Pinning, announces hash of website's authentic TLS certificate    Public-Key-Pins: max-age=2592000, pin-sha256="E9CZ9INDbd+2eRQozYqqbQ2yXLVKB9+xcprMF+44U1g=",    Permanent
     */
    PUBLIC_KEY_PINS = 'Public-Key-Pins',

    /**
     * Used in redirection, or when a new resource has been created. This refresh redirects after 5 seconds.    Refresh: 5, url=http://www.w3.org/pub/WWW/People.html    Proprietary and non-standard: a header extension introduced by Netscape and supported by most web browsers.
     */
    REFRESH = 'Refresh',

    /**
     * If an entity is temporarily unavailable, this instructs the client to try again later. Value could be a specified period of time (in seconds) or a HTTP-date.
     Example 1: Retry-After: 120
     Example 2: Retry-After: Fri, 07 Nov 2014 23:59:59 GMT
     Permanent
     *
     */
    RETRY_AFTER = 'Retry-After',

    /**
     * A name for the server    Server: Apache/2.4.1 (Unix)    Permanent
     */
    SERVER = 'Server',

    /**
     * An HTTP cookie    Set-Cookie: UserID=JohnDoe, Max-Age=3600, Version=1    Permanent: standard
     */
    SET_COOKIE = 'Set-Cookie',

    /**
     * CGI header field specifying the status of the HTTP response. Normal HTTP responses use a separate "Status-Line" instead, defined by RFC 7230.    Status: 200 OK    Not listed as a registered field name
     */
    STATUS = 'Status',

    /**
     * A HSTS Policy informing the HTTP client how long to cache the HTTPS only policy and whether this applies to subdomains.    Strict-Transport-Security: max-age=16070400, includeSubDomains    Permanent: standard
     */
    STRICT_TRANSPORT_SECURITY = 'Strict-Transport-Security',

    /**
     * The Trailer general field value indicates that the given set of header fields is present in the trailer of a message encoded with chunked transfer coding.    Trailer: Max-Forwards    Permanent
     */
    TRAILER = 'Trailer',

    /**
     * The form of encoding used to safely transfer the entity to the user. Currently defined methods are: chunked, compress, deflate, gzip, identity.    Transfer-Encoding: chunked    Permanent
     */
    TRANSFER_ENCODING = 'Transfer-Encoding',

    /**
     * Ask the client to upgrade to another protocol.    Upgrade: HTTP/2.0, SHTTP/1.3, IRC/6.9, RTA/x11    Permanent
     */
    UPGRADE = 'Upgrade',

    /**
     * Tells downstream proxies how to match future request headers to decide whether the cached response can be used rather than requesting a fresh one from the origin server.    Vary: *    Permanent
     */
    VARY = 'Vary',

    /**
     * Informs the client of proxies through which the response was sent.    Via: 1.0 fred, 1.1 example.com (Apache/1.1)    Permanent
     */
    VIA = 'Via',

    /**
     * A general warning about possible problems with the entity body.    Warning: 199 Miscellaneous warning    Permanent
     */
    WARNING = 'Warning',

    /**
     * Indicates the authentication scheme that should be used to access the requested entity.    WWW-Authenticate: Basic    Permanent
     */
    WWW_AUTHENTICATE = 'WWW-Authenticate',

    /**
     * Clickjacking protection: deny - no rendering within a frame, sameorigin - no rendering if origin mismatch, allow-from - allow from specified location, allowall - non-standard, allow from any location    X-Frame-Options: deny    Obsolete
     */
    X_FRAME_OPTIONS = 'X-Frame-Options',

    /**
     * Cross-site scripting (XSS) filter    X-XSS-Protection: 1, mode=block
     */
    X_XSS_PROTECTION = 'X-XSS-Protection',

    /**
     * X-Content-Security-Policy, X-WebKit-CSP    Content Security Policy definition.    X-WebKit-CSP: default-src 'self'
     */
    CONTENT_SECURITY_POLICY = 'Content-Security-Policy,',

    /**
     * The only defined value, "nosniff", prevents Internet Explorer from MIME-sniffing a response away from the declared content-type. This also applies to Google Chrome, when downloading extensions.    X-Content-Type-Options: nosniff
     */
    X_CONTENT_TYPE_OPTIONS = 'X-Content-Type-Options',

    /**
     * specifies the technology (e.g. ASP.NET, PHP, JBoss) supporting the web application (version details are often in X-Runtime, X-Version, or X-AspNet-Version)    X-Powered-By: PHP/5.4.0
     */
    X_POWERED_BY = 'X-Powered-By',

    /**
     * Recommends the preferred rendering engine (often a backward-compatibility mode) to use to display the content. Also used to activate Chrome Frame in Internet Explorer.    X-UA-Compatible: IE=EmulateIE7
     X-UA-Compatible: IE=edge
     X-UA-Compatible: Chrome=1
     */
    X_UA_COMPATIBLE = 'X-UA-Compatible',

    /**
     * Provide the duration of the audio or video in seconds, only supported by Gecko browsers    X-Content-Duration: 42.666
     */
    X_CONTENT_DURATION = 'X-Content-Duration'

}
