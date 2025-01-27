-- Create a function to check if a column exists
create or replace function public.column_exists(table_name text, column_name text)
returns boolean
language plpgsql
security invoker
as $$
begin
  return exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
    and table_name = $1
    and column_name = $2
  );
end;
$$;

-- Grant execute permission to authenticated users
grant execute on function public.column_exists(text, text) to authenticated;
