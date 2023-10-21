GITHUB_CONNECTION_NAME="github"
GITHUB_CONNECTION_DISPLAY_NAME="GitHub"
GITHUB_CONNECTION_ICON_URL="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/GitHub_Invertocat_Logo.svg/400px-GitHub_Invertocat_Logo.svg.png"

if [ -z ${AUTH0_MANAGEMENT_DOMAIN} ]; then
  echo "AUTH0_MANAGEMENT_DOMAIN must be set to the Auth0 domain, e.g. shape-docs.eu.auth0.com"
  exit 1
fi
if [ -z ${AUTH0_MANAGEMENT_CLIENT_ID} ]; then
  echo "AUTH0_MANAGEMENT_CLIENT_ID must be to the client ID of the app used to communicate with Auth0's Management API."
  exit 1
fi
if [ -z ${AUTH0_MANAGEMENT_CLIENT_SECRET} ]; then
  echo "AUTH0_MANAGEMENT_CLIENT_SECRET must be to the client secret of the app used to communicate with Auth0's Management API."
  exit 1
fi

# Get an access token for the Management API.
TOKEN_RESPONSE=$(
  curl -s --request POST \
    --url "https://${AUTH0_MANAGEMENT_DOMAIN}/oauth/token" \
    --header "Content-Type: application/x-www-form-urlencoded" \
    --data grant_type=client_credentials \
    --data "client_id=${AUTH0_MANAGEMENT_CLIENT_ID}" \
    --data "client_secret=${AUTH0_MANAGEMENT_CLIENT_SECRET}" \
    --data "audience=https://${AUTH0_MANAGEMENT_DOMAIN}/api/v2/"
)
TOKEN=$(echo $TOKEN_RESPONSE | jq -r .access_token)

# Fetch all connections.
CONNECTIONS_RESPONSE=$(
  curl -s --request GET \
    --url "https://${AUTH0_MANAGEMENT_DOMAIN}/api/v2/connections" \
    --header "Authorization: Bearer ${TOKEN}"
)
SAFE_CONNECTIONS_RESPONSE=${CONNECTIONS_RESPONSE//\\n/\\\\n}

# Modify the GitHub Connection.
GITHUB_CONNECTION_ID=$(
  echo $SAFE_CONNECTIONS_RESPONSE | jq -r ".[] | select(.name == \"${GITHUB_CONNECTION_NAME}\") | .id"
)
GITHUB_CONNECTION_OPTIONS=$(
  echo $SAFE_CONNECTIONS_RESPONSE | jq -r ".[] | select(.name == \"${GITHUB_CONNECTION_NAME}\") | .options += {\"display_name\": \"${GITHUB_CONNECTION_DISPLAY_NAME}\", \"icon_url\": \"${GITHUB_CONNECTION_ICON_URL}\"} | .options"
)

# Post the updated options.
curl -s --request PATCH \
  --url "https://${AUTH0_MANAGEMENT_DOMAIN}/api/v2/connections/${GITHUB_CONNECTION_ID}" \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer ${TOKEN}" \
  --data "{ \"options\": ${GITHUB_CONNECTION_OPTIONS} }"
