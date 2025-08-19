// 既存データの状況確認スクリプト
const { neon } = require('@neondatabase/serverless');

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function checkExistingData() {
  try {
    console.log('🔍 既存の広告データの状況を確認しています...\n');

    // 全体的な統計
    const totalStats = await sql`
      SELECT 
        COUNT(*) as total_ads,
        COUNT(template_id) as with_template,
        COUNT(url_template_id) as with_url_template,
        COUNT(CASE WHEN template_id IS NULL THEN 1 END) as null_template,
        COUNT(CASE WHEN url_template_id IS NULL THEN 1 END) as null_url_template,
        COUNT(CASE WHEN template_id IS NULL AND url_template_id IS NULL THEN 1 END) as both_null
      FROM ad_contents;
    `;

    const stats = totalStats[0];
    console.log('📊 統計情報:');
    console.log(`  総広告数: ${stats.total_ads}`);
    console.log(`  テンプレートID有り: ${stats.with_template}`);
    console.log(`  URLテンプレートID有り: ${stats.with_url_template}`);
    console.log(`  テンプレートID NULL: ${stats.null_template}`);
    console.log(`  URLテンプレートID NULL: ${stats.null_url_template}`);
    console.log(`  両方とも NULL: ${stats.both_null}\n`);

    // NULL値を持つ具体的なレコード
    if (stats.null_template > 0 || stats.null_url_template > 0) {
      console.log('⚠️  NULL値を持つレコード:');
      
      const nullRecords = await sql`
        SELECT 
          id, 
          name, 
          template_id, 
          url_template_id, 
          status,
          created_at
        FROM ad_contents 
        WHERE template_id IS NULL OR url_template_id IS NULL
        ORDER BY created_at DESC;
      `;

      nullRecords.forEach(record => {
        console.log(`  ID: ${record.id}, 名前: "${record.name}"`);
        console.log(`    テンプレートID: ${record.template_id || 'NULL'}`);
        console.log(`    URLテンプレートID: ${record.url_template_id || 'NULL'}`);
        console.log(`    ステータス: ${record.status}`);
        console.log(`    作成日: ${record.created_at}\n`);
      });
    }

    // テンプレートとURLテンプレートの存在確認
    const templateCount = await sql`SELECT COUNT(*) as count FROM ad_templates;`;
    const urlTemplateCount = await sql`SELECT COUNT(*) as count FROM url_templates;`;
    
    console.log('📋 利用可能なテンプレート:');
    console.log(`  広告テンプレート数: ${templateCount[0].count}`);
    console.log(`  URLテンプレート数: ${urlTemplateCount[0].count}\n`);

    // マイグレーション推奨事項の判定
    console.log('💡 マイグレーション推奨事項:');
    
    if (stats.total_ads === 0) {
      console.log('  ✅ データが存在しないため、直接NOT NULL制約を追加可能');
    } else if (stats.null_template === 0 && stats.null_url_template === 0) {
      console.log('  ✅ 全てのレコードに値が設定済み、直接NOT NULL制約を追加可能');
    } else {
      console.log('  ⚠️  NULL値のレコードが存在するため、以下の対応が必要:');
      
      if (templateCount[0].count > 0 && urlTemplateCount[0].count > 0) {
        console.log('    1. 既存のNULLレコードにデフォルト値を設定');
        console.log('    2. その後NOT NULL制約を追加');
      } else {
        console.log('    1. まず適切なテンプレートを作成');
        console.log('    2. 既存のNULLレコードに値を設定');
        console.log('    3. その後NOT NULL制約を追加');
      }
    }

  } catch (error) {
    console.error('❌ データ確認中にエラーが発生しました:', error);
    process.exit(1);
  }
}

checkExistingData();