/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * App.js
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Image} from 'react-native';
import { createBottomTabNavigator } from 'react-navigation';
import Todo from './src/Todo';
import Bill from './src/Bill';

const todoIcon = ({focused}) => focused 
  ? <Image style={styles.tabImage} source={require('./assets/todo_active.png')}/>
  : <Image style={styles.tabImage} source={require('./assets/todo.png')}/> ;

const billIcon = ({focused}) => focused 
  ? <Image style={styles.tabImage} source={require('./assets/bill_active.png')}/>
  : <Image style={styles.tabImage} source={require('./assets/bill.png')}/> ;

export default createBottomTabNavigator(
  {
    Todo: {
      screen: Todo,
      navigationOptions: {
        tabBarIcon: todoIcon,
        tabBarLabel: '待办'
      },
    },
    Bill: {
      screen: Bill,
      navigationOptions: {
        tabBarIcon: billIcon,
        tabBarLabel: '账单'
      },
    }
  },
  {
    tabBarOptions: {
      activeTintColor: '#3569f4',
      inactiveTintColor: '#aaa'
    }
  }
);

const styles = StyleSheet.create({
  tabImage: {
    width: 24,
    height: 24
  }
});
