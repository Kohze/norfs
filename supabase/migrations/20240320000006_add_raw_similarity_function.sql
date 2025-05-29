-- Drop the existing function first to allow changing the return type
DROP FUNCTION IF EXISTS find_similar_norfs_raw(vector, text, float8, int);

-- Recreate the function with corrected logic and return type
create or replace function find_similar_norfs_raw(
  p_target_vector vector,
  p_exclude_gene_id text,
  p_max_distance float8 default 0.2, -- Renamed, default assumes lower distance is better (0.2 distance = 0.8 similarity)
  p_limit int default 10
)
returns table (
  gene_id text,
  distance float8, -- Renamed return column
  seqname text,
  start integer,
  "end" integer,
  strand text,
  feature text
)
language sql
as $$
  select
    nf.gene_id,
    (nf.feature_vector <=> p_target_vector) as distance, -- Renamed alias
    n.seqname,
    n.start,
    n."end",
    n.strand,
    n.feature
  from norf_features nf
  join norfs n on n.gene_id = nf.gene_id
  where nf.gene_id != p_exclude_gene_id
  and (nf.feature_vector <=> p_target_vector) < p_max_distance -- Corrected filtering logic
  order by distance asc -- Corrected ordering
  limit p_limit;
$$; 