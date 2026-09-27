create table admins
(
    id            bigint generated always as identity primary key,
    name          varchar(50)  not null unique,
    password_hash varchar(100) not null,
    role          varchar(20)  not null
);

-- Only one Admin may ever exist: registration closes once the first account is created.
create unique index admins_single_admin on admins ((true));

create table bottles
(
    id          bigint generated always as identity primary key,
    name        varchar(100) not null,
    spirit_kind varchar(50)  not null,
    sipping     boolean      not null default false,
    description text,
    status      varchar(20)  not null,
    created_at  timestamptz  not null default now(),
    updated_at  timestamptz  not null default now()
);

create table bottle_images
(
    bottle_id    bigint primary key references bottles (id) on delete cascade,
    content_type varchar(50) not null,
    data         bytea       not null
);

create table mixers
(
    id       bigint generated always as identity primary key,
    name     varchar(100) not null unique,
    liquid   boolean      not null default true,
    in_stock boolean      not null default false
);

create table cocktails
(
    id          bigint generated always as identity primary key,
    name        varchar(100) not null unique,
    description text         not null default '',
    ice_in_cup  boolean      not null default false
);

-- One line of a recipe: an amount plus either a Spirit Kind or a Mixer, never both.
create table cocktail_ingredients
(
    id          bigint generated always as identity primary key,
    cocktail_id bigint      not null references cocktails (id) on delete cascade,
    position    int         not null,
    amount      varchar(50) not null,
    spirit_kind varchar(50),
    mixer_id    bigint references mixers (id),
    unique (cocktail_id, position),
    check ((spirit_kind is null) <> (mixer_id is null))
);

create index cocktail_ingredients_mixer on cocktail_ingredients (mixer_id);

-- The Cup Sequence: vessels in order, the last one is the serving glass.
create table cocktail_cups
(
    cocktail_id bigint      not null references cocktails (id) on delete cascade,
    position    int         not null,
    cup         varchar(30) not null,
    primary key (cocktail_id, position)
);
