// データベースNOT NULL制約追加スクリプト
const { neon } = require('@neondatabase/serverless');

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function addNotNullConstraints() {
  try {
    console.log('🚀 データベースNOT NULL制約追加を開始します...\n');

    // 事前確認: NULL値が存在しないことを再確認
    console.log('1️⃣ 事前確認: NULL値の存在チェック...');
    const nullCheck = await sql`
      SELECT 
        COUNT(CASE WHEN template_id IS NULL THEN 1 END) as null_template,
        COUNT(CASE WHEN url_template_id IS NULL THEN 1 END) as null_url_template
      FROM ad_contents;
    `;

    const nullCounts = nullCheck[0];
    if (nullCounts.null_template > 0 || nullCounts.null_url_template > 0) {
      console.error('❌ NULL値が存在するため、制約追加を中止します');
      console.error(`   template_id NULL: ${nullCounts.null_template}件`);
      console.error(`   url_template_id NULL: ${nullCounts.null_url_template}件`);
      process.exit(1);
    }
    console.log('✅ NULL値は存在しません。制約追加を続行します。\n');

    // 制約追加前の確認
    console.log('2️⃣ 現在の制約状況を確認...');
    try {
      const constraints = await sql`
        SELECT 
          column_name,
          is_nullable,
          data_type
        FROM information_schema.columns 
        WHERE table_name = 'ad_contents' 
          AND column_name IN ('template_id', 'url_template_id')
        ORDER BY column_name;
      `;

      constraints.forEach(col => {
        console.log(`   ${col.column_name}: ${col.data_type}, NULL許可: ${col.is_nullable}`);
      });
      console.log();
    } catch (error) {
      console.log('   制約情報の取得に失敗、続行します...\n');
    }

    // NOT NULL制約を追加
    console.log('3️⃣ NOT NULL制約を追加中...');
    
    // template_id制約追加
    try {
      await sql`ALTER TABLE ad_contents ALTER COLUMN template_id SET NOT NULL;`;
      console.log('✅ template_id NOT NULL制約を追加しました');
    } catch (error) {
      if (error.message.includes('already exists') || error.message.includes('not null')) {
        console.log('⚠️  template_id は既にNOT NULL制約が設定されています');
      } else {
        throw error;
      }
    }

    // url_template_id制約追加
    try {
      await sql`ALTER TABLE ad_contents ALTER COLUMN url_template_id SET NOT NULL;`;
      console.log('✅ url_template_id NOT NULL制約を追加しました');
    } catch (error) {
      if (error.message.includes('already exists') || error.message.includes('not null')) {
        console.log('⚠️  url_template_id は既にNOT NULL制約が設定されています');
      } else {
        throw error;
      }
    }

    // 制約追加後の確認
    console.log('\n4️⃣ 制約追加後の確認...');
    try {
      const finalConstraints = await sql`
        SELECT 
          column_name,
          is_nullable,
          data_type
        FROM information_schema.columns 
        WHERE table_name = 'ad_contents' 
          AND column_name IN ('template_id', 'url_template_id')
        ORDER BY column_name;
      `;

      finalConstraints.forEach(col => {
        const status = col.is_nullable === 'NO' ? '✅ NOT NULL' : '❌ NULL許可';
        console.log(`   ${col.column_name}: ${col.data_type}, ${status}`);
      });
    } catch (error) {
      console.log('   最終確認の取得に失敗しましたが、制約追加は完了しています');
    }

    // テスト: NULL値の挿入を試行（失敗することを確認）
    console.log('\n5️⃣ 制約テスト: NULL値挿入の拒否確認...');
    try {
      await sql`
        INSERT INTO ad_contents (name, template_id, url_template_id, status, content_data, created_by) 
        VALUES ('test', NULL, 1, 'draft', '{}', 1);
      `;
      console.log('❌ テスト失敗: NULL値が挿入されてしまいました');
    } catch (error) {
      if (error.message.includes('null value') || error.message.includes('not-null')) {
        console.log('✅ template_id NULL値の挿入が正しく拒否されました');
      } else {
        console.log('⚠️  予期しないエラーでNULL値挿入が拒否されました:', error.message);
      }
    }

    try {
      await sql`
        INSERT INTO ad_contents (name, template_id, url_template_id, status, content_data, created_by) 
        VALUES ('test', 1, NULL, 'draft', '{}', 1);
      `;
      console.log('❌ テスト失敗: NULL値が挿入されてしまいました');
    } catch (error) {
      if (error.message.includes('null value') || error.message.includes('not-null')) {
        console.log('✅ url_template_id NULL値の挿入が正しく拒否されました');
      } else {
        console.log('⚠️  予期しないエラーでNULL値挿入が拒否されました:', error.message);
      }
    }

    console.log('\n🎉 データベースNOT NULL制約の追加が完了しました！');
    console.log('   これで広告作成時に必ずtemplate_idとurl_template_idが必要になります。');

  } catch (error) {
    console.error('❌ NOT NULL制約追加中にエラーが発生しました:', error);
    process.exit(1);
  }
}

addNotNullConstraints();