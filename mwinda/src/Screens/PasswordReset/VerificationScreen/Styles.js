import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
        
    },
    header: {
        height: 220,
        
        justifyContent: 'center',
        backgroundColor: '#fec107',
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
        marginBottom: 20,
    },
    logo: {
        width: '70%',
        height: '60%',
        resizeMode: 'contain',
        alignSelf: 'center',
        transform: [{ translateY: 10 }],
    },
    formContainer: {
        flex: 1,
        paddingHorizontal: 30,
        paddingTop: 40,
    },
    title: {
        fontSize: 26,
        fontWeight: '800',
        color: '#2D3436',
        textAlign: 'center',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 16,
        color: '#636E72',
        textAlign: 'center',
        marginBottom: 40,
    },
    codeInput: {
        backgroundColor: '#FFFFFF',
        height: 65,
        width: '60%',
        alignSelf: 'center',
        borderRadius: 18,
        fontSize: 28,
        fontWeight: '700',
        color: '#2D3436',
        borderWidth: 2,
        borderColor: '#EDEFF1',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
        marginBottom: 35,
    },
    validateButton: {
        backgroundColor: '#fec107',
        paddingVertical: 18,
        paddingHorizontal: 40,
        borderRadius: 16,
        alignSelf: 'center',
        width: '80%',
        shadowColor: '#F5B301',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 8,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2D3436',
        textAlign: 'center',
        letterSpacing: 0.8,
    },
});

export default styles;