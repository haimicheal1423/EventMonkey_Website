# Table of contents

1. [Server Environment Configuration](#server-environment-configuration)
2. [Database Table DDL](#database-ddl)

## Server Environment Configuration

The files are not shared through version control, so you will need to create them in the appropriate directory.

### Environment File for `npm run local`

The local configuration properties must be set in the `.env-local` text file, which should be placed in the directory
containing
`package.json`.

### Environment File for `npm run prod`

Similar to the local configuration, the production properties must be set in the `.env-prod` text file, which should be
placed in the
directory containing `package.json`.

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

### Example

```
# .env-local file

DB_HOST              = localhost
DB_USER              = dev
DB_PASSWORD          = 12345
DB_NAME              = event_monkey
DB_CONN_LIMIT        = 5
TICKETMASTER_API_KEY = 7elxdku9GGG5k8j0Xm8KWdANDgecHMV0
```


# Database DDL

EventMonkey uses [MariaDB](https://mariadb.com/) which is a relational database management system. Listed below are all the SQL table definitions required to run this server.

```mariadb
CREATE TABLE `User`
(
    `user_id`       INT AUTO_INCREMENT,
    `type`          TINYTEXT NOT NULL,
    `email`         TINYTEXT NOT NULL,
    `password`      TINYTEXT NOT NULL,
    `username`      TINYTEXT NOT NULL,
    `profile_image` INT DEFAULT NULL,

    PRIMARY KEY (`user_id`),

    FULLTEXT INDEX (`email`, `password`)
);
```

```mariadb
CREATE TABLE `Event`
(
    `event_id`     INT AUTO_INCREMENT,
    `name`         TINYTEXT NOT NULL,
    `description`  TEXT DEFAULT NULL,
    `location`     TINYTEXT NOT NULL,
    `dates`        TEXT     NOT NULL,
    `price_ranges` TEXT DEFAULT NULL,

    PRIMARY KEY (`event_id`),

    FULLTEXT INDEX (`name`, `description`)
);
```

```mariadb
CREATE TABLE Genre
(
    `genre_id` INT AUTO_INCREMENT,
    `name`     VARCHAR(255) UNIQUE,

    PRIMARY KEY (`genre_id`),

    FULLTEXT INDEX (`name`)
);
```

```mariadb
CREATE TABLE Image
(
    `image_id` INT AUTO_INCREMENT,
    `ratio`    TINYTEXT NOT NULL,
    `width`    INT      NOT NULL,
    `height`   INT      NOT NULL,
    `url`      VARCHAR(255) UNIQUE,

    PRIMARY KEY (`image_id`),

    FULLTEXT INDEX (`url`)
);
```

```mariadb
CREATE TABLE Event_Genre_List
(
    `event_id` INT,
    `genre_id` INT,

    PRIMARY KEY (`event_id`, `genre_id`),
    INDEX (`genre_id`, `event_id`),

    FOREIGN KEY (`event_id`)
        REFERENCES `Event` (`event_id`)
        ON DELETE CASCADE,

    FOREIGN KEY (`genre_id`)
        REFERENCES `Genre` (`genre_id`)
        ON DELETE CASCADE
);
```

```mariadb
CREATE TABLE Event_Image_List
(
    `event_id` INT,
    `image_id` INT,

    PRIMARY KEY (`event_id`, `image_id`),

    FOREIGN KEY (`event_id`)
        REFERENCES `Event` (`event_id`)
        ON DELETE CASCADE,

    FOREIGN KEY (`image_id`)
        REFERENCES `Image` (`image_id`)
        ON DELETE CASCADE
);
```

```mariadb
CREATE TABLE Attendee_Interest_List
(
    `user_id`  INT,
    `genre_id` INT,

    PRIMARY KEY (`user_id`, `genre_id`),

    FOREIGN KEY (`user_id`)
        REFERENCES `User` (`user_id`)
        ON DELETE CASCADE,

    FOREIGN KEY (`genre_id`)
        REFERENCES `Genre` (`genre_id`)
        ON DELETE CASCADE
);
```

```mariadb
CREATE TABLE User_EM_Event_List
(
    `user_id`  INT,
    `event_id` INT,

    PRIMARY KEY (`user_id`, `event_id`),

    FOREIGN KEY (`user_id`)
        REFERENCES `User` (`user_id`)
        ON DELETE CASCADE,

    FOREIGN KEY (`event_id`)
        REFERENCES `Event` (`event_id`)
        ON DELETE CASCADE
);
```

```mariadb
CREATE TABLE User_TM_Event_List
(
    `user_id`  INT,
    `event_id` VARCHAR(255),

    PRIMARY KEY (`user_id`, `event_id`),

    FOREIGN KEY (`user_id`)
        REFERENCES `User` (`user_id`)
        ON DELETE CASCADE
);
```
