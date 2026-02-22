import Reactotron from 'reactotron-react-native';

Reactotron
  .configure({
    name: 'React Native MWINDA', // Nom affiché dans l'interface de Reactotron
    host: '192.168.2.13', // Remplacez par l'adresse IP de votre machine locale
  })
  .useReactNative() // Ajoute des plugins pour React Native
  .connect(); // Connecte Reactotron à l'application

console.tron = Reactotron; // Ajoute un raccourci console.tron.log

export default Reactotron;
