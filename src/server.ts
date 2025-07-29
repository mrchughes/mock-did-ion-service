import { App } from './app';

const PORT = parseInt(process.env.PORT || '3000', 10);

const app = new App();
app.listen(PORT);
