/**
 * データベーススキーマ更新スクリプト
 * ad_templatesテーブルからplaceholdersカラムを削除
 */

const { neon } = require('@neondatabase/serverless');

async function removePlaceholdersColumn() {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log('🔍 データベース接続確認中...');
    
    // 現在のテーブル構造を確認
    const tableInfo = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'ad_templates' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `;
    
    console.log('📋 現在のad_templatesテーブル構造:');
    tableInfo.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // placeholdersカラムの存在確認
    const placeholdersColumn = tableInfo.find(col => col.column_name === 'placeholders');
    if (!placeholdersColumn) {
      console.log('✅ placeholdersカラムは既に存在しません。処理を終了します。');
      return;
    }
    
    console.log('💾 placeholdersカラムのデータをバックアップ中...');
    
    // 既存データのバックアップを作成
    const backupData = await sql`
      SELECT id, name, html, placeholders, description, created_at, updated_at
      FROM ad_templates
      ORDER BY id;
    `;
    
    console.log(`📊 バックアップ対象: ${backupData.length}件のテンプレート`);
    
    // バックアップファイルに出力（JSONファイルとして保存）
    const fs = require('fs');
    const path = require('path');
    const backupDir = path.join(__dirname, 'backups');
    
    // バックアップディレクトリを作成
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFilePath = path.join(backupDir, `ad_templates_placeholders_backup_${timestamp}.json`);
    
    fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2));
    console.log(`💾 バックアップファイル作成: ${backupFilePath}`);
    
    // placeholdersカラムを削除
    console.log('🗑️  placeholdersカラムを削除中...');
    await sql`ALTER TABLE ad_templates DROP COLUMN IF EXISTS placeholders;`;
    
    console.log('✅ placeholdersカラムの削除が完了しました');
    
    // 削除後のテーブル構造を確認
    const newTableInfo = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'ad_templates' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `;
    
    console.log('📋 更新後のad_templatesテーブル構造:');
    newTableInfo.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // データ整合性を検証
    console.log('🔍 データ整合性を検証中...');
    const remainingTemplates = await sql`SELECT COUNT(*) as count FROM ad_templates;`;
    console.log(`📊 残存テンプレート数: ${remainingTemplates[0].count}件`);
    
    if (remainingTemplates[0].count !== backupData.length) {
      throw new Error('⚠️  データ数に不整合があります！バックアップを確認してください。');
    }
    
    console.log('🎉 データベーススキーマ更新が正常に完了しました！');
    console.log(`📄 バックアップファイル: ${backupFilePath}`);
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    console.log('🔄 必要に応じてバックアップからデータを復元してください。');
    throw error;
  }
}

// スクリプト実行部分
if (require.main === module) {
  removePlaceholdersColumn()
    .then(() => {
      console.log('✨ スクリプト実行完了');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 スクリプト実行失敗:', error);
      process.exit(1);
    });
}

module.exports = { removePlaceholdersColumn };