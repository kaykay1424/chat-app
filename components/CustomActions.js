import React from 'react';
import {Alert, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import PropTypes from 'prop-types';
import {Camera} from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';


export default class CustomActions extends React.Component {
    state = {
        image: null
    }

    chooseAvatar = async () => {
        Alert.alert(
            'Choose Avatar',
            'Do you want to choose a photo or take a photo?',
            [
                {
                    text: 'Cancel',
                },
                { 
                    text: 'Choose Photo', 
                    onPress: () => this.choosePhoto('avatar')
                },
                { 
                    text: 'Take Photo', 
                    onPress: () => this.takePhoto('avatar')
                }
            ]
        );
    }

    chooseLocation = async () => {
        const {status} = await Location.requestForegroundPermissionsAsync();

        if (status === 'granted') {
            this.props.setChoosingOption(true);
            const result = await Location
                .getCurrentPositionAsync({accuracy: Location.Accuracy.High});
            this.props.setLocation(result.coords);
        }
    }
    
    choosePhoto = async (imageType = null) => {
        const {status} = await Camera.requestPermissionsAsync();

        if (status === 'granted') {
            this.props.setChoosingOption(true);
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'Images',
            })
            // eslint-disable-next-line no-console
                .catch(error => console.log(error));

            if (result && !result.cancelled) 
                this.props.savePhoto(
                    result.uri, imageType ? 'avatar' : 'image');
        }
    }

    takePhoto = async (imageType = null) => {
        const {status} = await Camera.requestCameraPermissionsAsync();

        if (status === 'granted') {
            this.props.setChoosingOption(true);
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: 'Images'
            })
            // eslint-disable-next-line no-console
                .catch(error => console.log(error)); 

            if (result && !result.cancelled) 
                this.props.savePhoto(
                    result.uri, imageType ? 'avatar' : 'image');
        }
    }

    onActionPress = () => {
        const options = [
            'Choose Avatar',
            'Choose From Library', 
            'Take Picture', 
            'Share Location', 
            'Cancel'
        ];
        const cancelButtonIndex = options.length - 1;
        this.context.actionSheet().showActionSheetWithOptions(
            {
                options,
                cancelButtonIndex,
            },
            async (buttonIndex) => {
                switch (buttonIndex) {
                    case 0:
                        this.chooseAvatar();
                        return;
                    case 1:
                        this.choosePhoto();
                        return;
                    case 2:
                        this.takePhoto();
                        return;
                    case 3:
                        this.chooseLocation();
                        return;
                    default:
                }
            },
        );
    };
 
    render() {
        return (
            <TouchableOpacity 
                style={[styles.container]} 
                onPress={this.onActionPress}
                accessible={true}
                accessibilityLabel="More options"
                accessibilityHint="Choose to send an image or your location"
                accessibilityRole="button"
            >
                <View style={[styles.wrapper, this.props.wrapperStyle]}>
                    <Text 
                        style={[
                            styles.iconText, 
                            this.props.iconTextStyle
                        ]}>+</Text>
                </View>
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        height: 26,
        marginLeft: 10,
        marginBottom: 10,
        width: 26,
    },
    wrapper: {
        borderRadius: 13,
        borderColor: '#b2b2b2',
        borderWidth: 2,
        flex: 1,
    },
    iconText: {
        backgroundColor: 'transparent',
        color: '#b2b2b2',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
    },
});

CustomActions.contextTypes = {
    actionSheet: PropTypes.func.isRequired,
};
CustomActions.propTypes = {
    iconTextStyle: PropTypes.shape(),
    savePhoto: PropTypes.func.isRequired,
    setChoosingOption: PropTypes.func.isRequired,
    setLocation: PropTypes.func.isRequired,
    wrapperStyle: PropTypes.shape()
};