/**
 * AddButton.js
 * @format
 * @flow
 */

import React, {Component} from 'react';
import Button from 'react-native-button';
import {Image, View, StyleSheet, Modal, Dimensions} from 'react-native';
import Toaster from 'react-native-toaster';

type Props = {
  isModalShown: boolean,
  dismiss: () => void,
  editForm: any,
  message: object
};

export default class EditModal extends Component<Props> {
  render () {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={this.props.isModalShown}
        onDismiss={this.props.dismiss}
        onRequestClose={this.props.dismiss}>
        <View style={styles.modalCover}>
          {this.props.editForm}
        </View>
        <Toaster message={this.props.message}/>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  modalCover: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: "center", 
    alignItems: "center"
  }
});
