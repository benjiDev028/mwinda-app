import {Image,StyleSheet,View} from 'react-native';
import splash from '../../assets/img/splash.png';

export default function SplashScreen()
{
    return(
        <View styles={styles.container}>
            <View>
            <Image source={splash} style={styles.image}/>
            </View >

        </View>
    )
}


const styles  = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor :"#fec107",
    },
    image:{
        width:'100%', height:'100%' , resizeMode : 'contain',backgroundColor:'#fec107'
    }
})