create table cocktail_images (
    cocktail_id  bigint primary key references cocktails (id) on delete cascade,
    content_type varchar(50) not null,
    data         bytea       not null
);
