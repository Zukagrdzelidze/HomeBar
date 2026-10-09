-- An Order: a Guest asking for one Cocktail under their name. The row is deleted once the Admin has made it.
create table orders
(
    id          bigint generated always as identity primary key,
    cocktail_id bigint      not null references cocktails (id) on delete cascade,
    guest_name  varchar(50) not null,
    created_at  timestamptz not null default now()
);
