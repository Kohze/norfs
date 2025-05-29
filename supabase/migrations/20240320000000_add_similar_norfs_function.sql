-- Function to find similar nORFs based on vector similarity
create or replace function find_similar_norfs(
    target_gene_id text,
    similarity_threshold float8 default 0.8,
    max_results int default 10
)
returns table (
    gene_id text,
    similarity float8
) 
language plpgsql
as $$
declare
    target_vector vector;
begin
    -- Get the feature vector for the target nORF
    select feature_vector into target_vector
    from norf_features
    where gene_id = target_gene_id;

    -- If no vector found, return empty result
    if target_vector is null then
        return;
    end if;

    -- Find similar nORFs using direct vector similarity calculation
    -- Using cosine similarity: (a·b)/(|a|·|b|)
    return query
    select 
        nf.gene_id,
        (nf.feature_vector <=> target_vector) as similarity
    from norf_features nf
    where nf.gene_id != target_gene_id  -- Exclude the target nORF
    and (nf.feature_vector <=> target_vector) > similarity_threshold
    order by similarity desc
    limit max_results;
end;
$$; 