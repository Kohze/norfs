import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
)

const updateFunction = async () => {
  const { error } = await supabase.rpc('update_similar_norfs_function', {
    function_sql: `
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
    `,
  })

  if (error) {
    console.error('Error updating function:', error)
    return false
  }
  return true
}

// Run the update
updateFunction()
  .then((success) => {
    if (success) {
      console.log('Successfully updated find_similar_norfs function')
    } else {
      console.error('Failed to update function')
    }
  })
  .catch((err) => {
    console.error('Error:', err)
  })
