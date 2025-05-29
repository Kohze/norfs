-- Function to update other functions via RPC
create or replace function update_similar_norfs_function(function_sql text)
returns void
language plpgsql
security definer
as $$
begin
  execute function_sql;
end;
$$; 