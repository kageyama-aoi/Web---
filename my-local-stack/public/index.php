<?php
declare(strict_types=1);
session_start();

$host = getenv('DB_HOST') ?: 'db';
$db   = getenv('DB_NAME') ?: 'myapp';
$user = getenv('DB_USER') ?: 'myuser';
$pass = getenv('DB_PASS') ?: 'mypassword';

function h(string $s): string { return htmlspecialchars($s, ENT_QUOTES, 'UTF-8'); }
function redirect(string $p): never { header("Location: {$p}"); exit; }
function flash(string $k, ?string $v=null) {
  if ($v === null) { $m = $_SESSION['flash'][$k] ?? null; unset($_SESSION['flash'][$k]); return $m; }
  $_SESSION['flash'][$k] = $v;
}
if (empty($_SESSION['csrf'])) { $_SESSION['csrf'] = bin2hex(random_bytes(16)); }
function csrf_field(): string { return '<input type="hidden" name="csrf" value="'.h($_SESSION['csrf']).'">'; }
function assert_csrf(): void {
  if (!isset($_POST['csrf']) || !hash_equals($_SESSION['csrf'] ?? '', $_POST['csrf'])) {
    http_response_code(400); echo '<h1>Bad Request</h1><p>CSRF token mismatch.</p>'; exit;
  }
}

try {
  $pdo = new PDO("mysql:host={$host};dbname={$db};charset=utf8mb4", $user, $pass, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
  ]);
} catch (Throwable $e) {
  http_response_code(500);
  echo "<h1>DB接続に失敗しました</h1><pre>".h($e->getMessage())."</pre>"; exit;
}

$action = $_GET['action'] ?? 'index';

if ($action === 'store' && $_SERVER['REQUEST_METHOD'] === 'POST') {
  assert_csrf();
  $name = trim($_POST['name'] ?? '');
  $price = trim($_POST['price'] ?? '');
  $errors = [];
  if ($name === '') $errors[] = '名前は必須です';
  if ($price === '' || !ctype_digit($price) || (int)$price < 0) $errors[] = '価格は0以上の整数で入力してください';
  if ($errors) { flash('errors', implode('<br>', array_map('h', $errors))); flash('old', json_encode(['name'=>$name,'price'=>$price])); redirect('./?action=create'); }
  $stmt = $pdo->prepare('INSERT INTO items(name, price) VALUES(:name, :price)');
  $stmt->execute([':name'=>$name, ':price'=>(int)$price]);
  flash('success', '登録しました'); redirect('./');

} elseif ($action === 'update' && $_SERVER['REQUEST_METHOD'] === 'POST') {
  assert_csrf();
  $id = (int)($_GET['id'] ?? 0);
  $name = trim($_POST['name'] ?? '');
  $price = trim($_POST['price'] ?? '');
  $errors = [];
  if ($id <= 0) $errors[] = '不正なIDです';
  if ($name === '') $errors[] = '名前は必須です';
  if ($price === '' || !ctype_digit($price) || (int)$price < 0) $errors[] = '価格は0以上の整数で入力してください';
  if ($errors) { flash('errors', implode('<br>', array_map('h', $errors))); redirect('./?action=edit&id='.$id); }
  $stmt = $pdo->prepare('UPDATE items SET name=:name, price=:price WHERE id=:id');
  $stmt->execute([':name'=>$name, ':price'=>(int)$price, ':id'=>$id]);
  flash('success', '更新しました'); redirect('./');

} elseif ($action === 'destroy' && $_SERVER['REQUEST_METHOD'] === 'POST') {
  assert_csrf();
  $id = (int)($_GET['id'] ?? 0);
  if ($id > 0) { $stmt = $pdo->prepare('DELETE FROM items WHERE id=:id'); $stmt->execute([':id'=>$id]); }
  flash('success', '削除しました'); redirect('./');

} else {
  $success = flash('success'); $errors = flash('errors'); $content = '';
  if ($action === 'create') {
    $old = json_decode(flash('old') ?? '{}', true);
    $content .= '<h2>商品を追加</h2>'.($errors ? '<div class="alert alert-error">'.$errors.'</div>':'' ).'
      <form method="post" action="?action=store">'.csrf_field().'
        <div class="field"><label>名前</label><input type="text" name="name" value="'.h($old['name']??'').'" required></div>
        <div class="field"><label>価格（整数）</label><input type="number" name="price" min="0" step="1" value="'.h($old['price']??'').'" required></div>
        <div class="actions"><button type="submit">登録する</button> <a class="btn" href="./">戻る</a></div>
      </form>';
  } elseif ($action === 'edit') {
    $id = (int)($_GET['id'] ?? 0);
    $stmt = $pdo->prepare('SELECT * FROM items WHERE id=:id'); $stmt->execute([':id'=>$id]); $item = $stmt->fetch();
    if (!$item) { http_response_code(404); echo '<h1>Not Found</h1>'; exit; }
    $content .= '<h2>ID #'.(int)$item['id'].' を編集</h2>'.($errors ? '<div class="alert alert-error">'.$errors.'</div>':'' ).'
      <form method="post" action="?action=update&id='.(int)$item['id'].'">'.csrf_field().'
        <div class="field"><label>名前</label><input type="text" name="name" value="'.h($item['name']).'" required></div>
        <div class="field"><label>価格（整数）</label><input type="number" name="price" min="0" step="1" value="'.h((string)$item['price']).'" required></div>
        <div class="actions"><button type="submit">更新する</button> <a class="btn" href="./">戻る</a></div>
      </form>';
  } else {
    // 検索条件の取得
    $search_name = trim($_GET['name'] ?? '');
    $search_price = trim($_GET['price'] ?? '');

    // ベースのSQLとパラメータ
    $sql = 'SELECT id, name, price, created_at FROM items';
    $where = [];
    $params = [];

    // 条件の組み立て
    if ($search_name !== '') {
        $where[] = 'name LIKE :name';
        $params[':name'] = $search_name . '%';
    }
    if ($search_price !== '' && ctype_digit($search_price)) {
        $where[] = 'price = :price';
        $params[':price'] = (int)$search_price;
    }

    if (!empty($where)) {
        $sql .= ' WHERE ' . implode(' AND ', $where);
    }
    $sql .= ' ORDER BY id DESC';

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    $content .= '<div class="toolbar"><a class="btn primary" href="?action=create">＋ 追加</a></div>';

    // 検索フォーム
    $content .= '
      <form method="get" action="./" class="search-form">
        <div class="field-group">
          <div class="field"><label>名前（前方一致）</label><input type="text" name="name" value="'.h($search_name).'"></div>
          <div class="field"><label>価格（完全一致）</label><input type="number" name="price" min="0" step="1" value="'.h($search_price).'"></div>
        </div>
        <div class="actions">
          <button type="submit" class="btn">検索</button>
          <a class="btn" href="./">リセット</a>
        </div>
      </form>
    ';

    $content .= ($success ? '<div class="alert alert-ok">'.$success.'</div>':'')
      .'<table><thead><tr><th>ID</th><th>名前</th><th>価格</th><th>作成日時</th><th>操作</th></tr></thead><tbody>';
    foreach ($rows as $r) {
      $content .= '<tr><td>'.(int)$r['id'].'</td><td>'.h($r['name']).'</td><td>'.(int)$r['price'].'</td><td>'.h((string)$r['created_at']).'</td>
        <td class="ops"><a class="btn" href="?action=edit&id='.(int)$r['id'].'">編集</a>
        <form method="post" action="?action=destroy&id='.(int)$r['id'].'" onsubmit="return confirm(\'本当に削除しますか？\');" style="display:inline">'.csrf_field().'<button type="submit" class="btn danger">削除</button></form></td></tr>';
    }
    if (!$rows) { $content .= '<tr><td colspan="5" style="text-align:center; color:#777">データがありません</td></tr>'; }
    $content .= '</tbody></table>';
  }

  echo '<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Items CRUD（PHP → MySQL）</title>
  <style>:root{--bg:#fff;--fg:#111;--muted:#666;--line:#e5e7eb;--pri:#2563eb}
  *{box-sizing:border-box} body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;margin:24px;color:var(--fg);background:var(--bg);line-height:1.6}
  h1{font-size:22px;margin:0 0 12px} h2{font-size:18px;margin:12px 0}
  table{border-collapse:collapse;width:100%;max-width:900px;margin-top:12px} th,td{border:1px solid var(--line);padding:10px} th{background:#f8fafc;text-align:left}
  .toolbar{margin:12px 0} .btn{display:inline-block;padding:.45em .8em;border:1px solid var(--line);border-radius:.5em;text-decoration:none;color:var(--fg);background:#f8fafc}
  .btn.primary{background:#2563eb;border-color:#2563eb;color:#fff} .btn.danger{background:#fee2e2;border-color:#fecaca;color:#b91c1c}
  .actions{margin-top:12px} .field{margin:8px 0;max-width:420px} input[type=text],input[type=number]{width:100%;padding:.5em;border:1px solid var(--line);border-radius:.4em}
  .alert{margin:10px 0;padding:.6em .8em;border-radius:.5em} .alert-ok{background:#e6ffed;border:1px solid #b7ebc6} .alert-error{background:#fee2e2;border:1px solid #fecaca}
  .ops form{display:inline} .meta{color:var(--muted);font-size:12px;margin-top:4px} .wrap{max-width:960px} header{display:flex;gap:8px;margin-bottom:10px;align-items:end}
  header .meta{margin-left:auto;color:#666;font-size:12px}
  /* 検索フォーム用スタイル */
  .search-form{background:#f8fafc;border:1px solid var(--line);padding:16px;border-radius:.5em;margin:12px 0;max-width:900px}
  .search-form .field-group{display:flex;gap:12px;align-items:flex-end}
  .search-form .field{flex:1}
  .search-form .actions{margin-top:12px}
  .search-form .actions .btn{margin-right:8px}</style>
  <div class="wrap"><header><h1>Items CRUD（PHP → MySQL）</h1><div class="meta">接続先：'.h("$host / $db / $user").'</div></header>'.$content.'</div>';
}