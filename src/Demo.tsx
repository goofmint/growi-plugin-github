import React from 'react';

import ReactDOM from 'react-dom/client';

import { gitHub } from './GitHub';

const href = 'https://qiita.com/tags/growi/feed';

const GitHub = gitHub(() => <a href={href}>RSS</a>);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
  </React.StrictMode>,
);
