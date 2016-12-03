# Lambda-Polly-Notification
Utilize AWS Polly to speak notifications to a media player on your home-assistant installation. More info to come.

### Requires:
* AWS Lambda (Node.js 4.3)
* AWS API Gateway
* AWS S3 Bucket

### Deployment:
1. Create an AWS S3 Bucket
2. Modify following lines in index.js: 26, 40, 42, 48, 90, 96, 98, 104
3. Optionally modify the following lines in index.js: 51, 80, 107
4. zip up node_modules and index.js into a .zip file - keep them both in top-level, not in sub-directory
5. Upload to Lambda node.js 4.3 environment
6. Create a IAM role that has access to S3 and Polly, and assign the Lambda function to this IAM role
7. Create a trigger for Lambda as API gateway. Make API gateway be a LAMBDA_PROXY type
8. Create API key for API gateway, and set access as "API Required" = true

### Usage:
In Home Assistant configuration, here are some sample configurations:

`
notify:
- name: "AWS Polly"
  platform: command_line
  command: "xargs --replace=@ curl -X GET -H 'Content-Type: application/json' -H 'x-api-key: YOUR_API_KEY' -G https://YOUR_API_ENDPOINT.us-east-1.amazonaws.com/prod --data-urlencode 'text=@'"

automation:
- alias: 'Welcome home'
  hide_entity: true
  trigger:
    platform: state
    entity_id: group.all_devices
    state: 'home'
  action:
    service: notify.AWS_Polly
      data:
        message: "Hi, this is your house speaking. Welcome home!"
`
### TO-DO
Lots!
