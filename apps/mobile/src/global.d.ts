// Cho phép import CSS (side-effect) và CSS Modules trong app Expo (web).
declare module '*.css';
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}
