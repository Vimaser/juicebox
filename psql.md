CREATING TABLES:

CREATE TABLE owners(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

NSERT INTO owners(name)
VALUES
    ('Trei'), ('James'), ('John')
RETURNING *; 

// returns immediately!


CREATE TABLE pets(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    breed VARCHAR(255) DEFAULT 'unknown',
    age INTEGER DEFAULT 5,
    "ownerId" INTEGER REFERENCES owners
    (id)
);

INSERT INTO pets(name, breed, age, "ownerId")
    VALUES
        ('Paris', 'German Shephard', '4', '1'),
        ('Toby', 'Terrier', '12', '2'),
        ('Little Bit', 'Teacup Poodle', '2', '3')
    RETURNING (id, name, "ownerId");

Defaults:
DEFAULT "somevalue"

References:
REFERENCES table(prop)

INSERT INTO table_name(column_name, next_column_name)
VALUES
    ('col 1 val 1', 'col 2 val 1'),
    ('col 2 val 2', 'col 2 val 2'),
RETURNING (return_col_name,
next_return_col_name);


I
   
