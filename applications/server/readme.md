# Server Environment Configuration

## Configuration Files

The files are not shared through version control, so you will need to create them in the appropriate directory.

### Environment File for `npm local`

The local configuration properties must be set in the `.env-local` text file, which should be placed in the directory
containing
`package.json`.

### Environment File for `npm prod`

Similar to the local configuration, the production properties must be set in the `.env-prod` text file, which should be
placed in the
directory containing `package.json`.

## Environment Properties

### Required Environment Properties

| Property             | Description                                      |
|----------------------|--------------------------------------------------|
| DB_HOST              | the hostname for the database connection         |
| DB_USER              | the database username                            |
| DB_PASSWORD          | the password for the database user               |
| DB_NAME              | the name of the database to use                  |
| TICKETMASTER_API_KEY | the api key to use for TicketMaster API requests |

### Optional Environment Properties

| Property      | Description                              | Default |
|---------------|------------------------------------------|---------|
| SERVER_PORT   | the port which this server is open on    | 4000    |
| DB_PORT       | the host port to connect to the database | 3306    |
| DB_CONN_LIMIT | the connection limit for database pools  | 10      |

## Example

```
# .env-local file

DB_HOST              = localhost
DB_USER              = dev
DB_PASSWORD          = 12345
DB_NAME              = event_monkey
DB_CONN_LIMIT        = 5
TICKETMASTER_API_KEY = 7elxdku9GGG5k8j0Xm8KWdANDgecHMV0
```
