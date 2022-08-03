import * as Font from 'expo-font';

export default loadFont = async() => {
    await Font.loadAsync({
        'TextFont': require('./assets/GloriaHallelujah-Regular.ttf')
    })
}