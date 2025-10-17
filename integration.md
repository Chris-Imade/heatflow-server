# HeatFlow Experts - API Integration Guide

This document provides detailed information about the HeatFlow Experts API endpoints, including request/response formats and examples.

## Base URL

All API endpoints are relative to the base URL:
```
https://api.heatflowexperts.co.uk/v1
```

## Authentication

No authentication is required for the public API endpoints.

## Rate Limiting

- All endpoints are rate limited to 100 requests per hour per IP address.
- Exceeding the limit will result in a `429 Too Many Requests` response.

## Headers

Include the following headers with all requests:

```http
Accept: application/vnd.heatflow.v1+json
Content-Type: application/json
```

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": "ErrorType",
  "message": "Human-readable error message",
  "requestId": "req_1234567890",
  "errors": [
    {
      "field": "fieldName",
      "message": "Error message for this field"
    }
  ]
}
```

### Common HTTP Status Codes

- `200 OK` - Request successful
- `400 Bad Request` - Invalid request data
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

## Endpoints

### 1. Submit Quote Request

Submit a new quote request for heating services.

**Endpoint:** `POST /quotes`

#### Request Body

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+441234567890",
  "address": "123 Example Street, Wellingborough, UK",
  "serviceType": "boiler",
  "timeframe": "1week",
  "message": "Looking to replace my old boiler with a more efficient model.",
  "privacyPolicyAccepted": true
}
```

#### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| firstName | string | Yes | Customer's first name |
| lastName | string | Yes | Customer's last name |
| email | string | Yes | Valid email address |
| phone | string | Yes | Contact phone number |
| address | string | Yes | Full property address |
| serviceType | string | Yes | Type of service (boiler, heat-pump, ac, smart, plumbing, other) |
| timeframe | string | Yes | When service is needed (urgent, 1week, 2weeks, 1month, flexible) |
| message | string | No | Additional details about the request |
| privacyPolicyAccepted | boolean | Yes | Must be `true` to submit the form |

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Quote request received successfully",
  "quoteId": "QUO-123456",
  "estimatedResponseTime": "24 hours"
}
```

### 2. Contact Form

Submit a general contact inquiry.

**Endpoint:** `POST /contact`

#### Request Body

```json
{
  "name": "Jane Smith",
  "email": "jane.smith@example.com",
  "subject": "General Inquiry",
  "message": "I have a question about your services.",
  "privacyPolicyAccepted": true
}
```

#### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Full name |
| email | string | Yes | Valid email address |
| subject | string | Yes | Subject of the inquiry |
| message | string | Yes | Detailed message |
| privacyPolicyAccepted | boolean | Yes | Must be `true` to submit the form |

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Your message has been sent successfully. We'll get back to you soon.",
  "ticketId": "TKT-789012"
}
```

### 3. Newsletter Subscription

Subscribe to the HeatFlow Experts newsletter.

**Endpoint:** `POST /newsletter/subscribe`

#### Request Body

```json
{
  "email": "subscriber@example.com"
}
```

#### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | Email address to subscribe |

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Successfully subscribed to our newsletter",
  "subscriptionId": "SUB-345678"
}
```

#### Already Subscribed Response (200 OK)

```json
{
  "success": true,
  "message": "This email is already subscribed to our newsletter",
  "subscriptionId": "SUB-345678"
}
```

## Example Requests

### cURL - Submit Quote

```bash
curl -X POST https://api.heatflowexperts.co.uk/v1/quotes \
  -H "Content-Type: application/json" \
  -H "Accept: application/vnd.heatflow.v1+json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+441234567890",
    "address": "123 Example Street, Wellingborough, UK",
    "serviceType": "boiler",
    "timeframe": "1week",
    "message": "Looking to replace my old boiler.",
    "privacyPolicyAccepted": true
  }'
```

### JavaScript (Fetch) - Contact Form

```javascript
const response = await fetch('https://api.heatflowexperts.co.uk/v1/contact', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/vnd.heatflow.v1+json'
  },
  body: JSON.stringify({
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    subject: 'General Inquiry',
    message: 'I have a question about your services.',
    privacyPolicyAccepted: true
  })
});

const data = await response.json();
console.log(data);
```

## Support

For any questions or issues with the API, please contact:
- Email: support@heatflowexperts.co.uk
- Phone: +1 (575) 205-6122

---

© 2025 HeatFlow Experts. All rights reserved.
