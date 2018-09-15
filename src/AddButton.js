/**
 * AddButton.js
 * @format
 * @flow
 */

import React, {Component} from 'react';
import Button from 'react-native-button';
import {Image, View, StyleSheet} from 'react-native';

type Props = {
  navigation: any
};

export default class AddButton extends Component<Props> {
  render () {
    return (
      <Button
        onPress={this.props.navigation.getParam('changeModal')}>
        <View style={styles.buttonContainer}>
          <Image style={{width: 20, height: 20}} source={require('../assets/add.png')}/>
        </View>
      </Button>
    );
  }
}

const styles = StyleSheet.create({
  buttonContainer: {
    width: 30, 
    height: 30, 
    marginRight: 10, 
    justifyContent: 'center', 
    alignItems: 'center'
  }
});
