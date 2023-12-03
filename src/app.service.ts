import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Hello HHP 2023✨</title>
        <meta charset="UTF-8" />
      </head>

      <body>
        <div id="app">
          <main>
            <section>
              <aside>
                <small>
                  🧭 hello world 
                </small>

                <h3>API</h3>
                <ul>
                  <li>
                    <a href="/api">
                      go to swagger docs 👉 /api 
                    </a>
                  </li>
                </ul>
              </aside>  
            </section>
          </main>
        </div>
        <link rel="stylesheet" href="https://unpkg.com/mvp.css"> 

        <script src="./index.mjs" type="module"></script>
      </body>
    </html>`;
  }
}
