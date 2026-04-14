const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const MESSAGES_FILE = path.join(__dirname, 'wiadomosci.json');

// Słownik rozszerzeń dla plików
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

const server = http.createServer((req, res) => {
  // Obsługa REST API dla formularza kontaktowego
  if (req.method === 'POST' && req.url === '/api/contact') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        
        // Czas i data
        const now = new Date();
        data.timestamp = now.toISOString();
        data.dateFormatted = now.toLocaleString('pl-PL');

        // Odczyt istniejących wiadomości
        let messages = [];
        if (fs.existsSync(MESSAGES_FILE)) {
          const fileContent = fs.readFileSync(MESSAGES_FILE, 'utf-8');
          if (fileContent.trim()) {
            messages = JSON.parse(fileContent);
          }
        }

        // Dodanie nowej i zapis w ładnym formacie JSON
        messages.push(data);
        fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2), 'utf-8');

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Wiadomość została zapisana.' }));
        
        console.log(`[+] Nowa wiadomość od: ${data.email} | Skrzynka ma teraz ${messages.length} e-maili.`);

      } catch (err) {
        console.error("Błąd przetwarzania wiadomości:", err);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Błąd przetwarzania danych.' }));
      }
    });
    return;
  }

  // Obsługa serwowania plików statycznych (HTML, CSS, JS, obrazki, Wideo)
  let filePath = req.url === '/' ? '/index.html' : req.url;
  try {
    filePath = decodeURIComponent(filePath.split('?')[0]);
  } catch (e) {
    filePath = filePath.split('?')[0];
  }
  
  filePath = path.join(__dirname, filePath);

  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.stat(filePath, (error, stat) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Błąd 404: Nie znaleziono pliku.');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Błąd 500: Problem serwera. Błąd: ' + error.code);
      }
      return;
    }

    // Dodanie obsługi range requests dla wideo (Safari / iOS / stabilne odtwarzanie)
    const range = req.headers.range;
    if (range && (extname === '.mp4' || extname === '.wav')) {
      const parts = range.replace(/bytes=/, "").split("-");
      const partialstart = parts[0];
      const partialend = parts[1];

      const start = parseInt(partialstart, 10);
      const end = partialend ? parseInt(partialend, 10) : stat.size - 1;
      const chunksize = (end - start) + 1;

      const file = fs.createReadStream(filePath, { start, end });
      res.writeHead(206, {
        'Content-Range': 'bytes ' + start + '-' + end + '/' + stat.size,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': contentType
      });
      file.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Length': stat.size
      });
      fs.createReadStream(filePath).pipe(res);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('============================================');
  console.log('🏁 MotoFan Serwer Rozpoczął Przebieg!');
  console.log('--------------------------------------------');
  console.log(`👉 Link na tym komputerze: http://localhost:${PORT}`);
  console.log(`👉 Link dla telefonów i innych PC: http://192.168.1.233:${PORT}`);
  console.log('--------------------------------------------');
  console.log('Wiadomości z formularza będą gromadzic się w `wiadomosci.json`.');
  console.log('Naciśnij CTRL+C w terminalu aby zamknąć ten serwer.');
  console.log('============================================\n');
});
