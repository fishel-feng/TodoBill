/**
 * Todo.js
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {Text, View, FlatList, StyleSheet, Image, Modal, TextInput, Dimensions} from 'react-native';
import Button from 'react-native-button';
import CheckBox from 'react-native-check-box';
import ActionSheet from 'react-native-actionsheet';
import { StackNavigator } from 'react-navigation';
import AddButton from './AddButton';
import EditModal from './EditModal';
import storage from './storage';

type Props = {
  navigation: any
};

type State = {
  todoData: Array<TodoItem>,
  text: string,
  isModalShown: boolean,
  toast: Toast | null
};

type Toast = {
  text: string,
  styles: object,
  duration: number
}

type TodoItem = {
  id: number,
  text: string,
  state: boolean
};

const TODO_KEY = 'todoList';

class Todo extends Component<Props, State> {

  current: TodoItem | typeof undefined;
  todoActionSheet: ActionSheet;

  state = {
    todoData: [],
    text: '',
    isModalShown: false
  };

  static navigationOptions = ({ navigation }) => {
    return {
      title: '待办事项',
      headerRight: <AddButton navigation={navigation}/>
    }
  };

  generateId () : number {
    return this.state.todoData.length ? this.state.todoData[0].id + 1 : 1000;
  }

  componentDidMount () {
    this.props.navigation.setParams({
      changeModal: this.changeModal
    });
    this.initTodoList();
  }

  async initTodoList () {
    try {
      const todoList = await storage.selectList(TODO_KEY);
      this.setState({
        todoData: todoList.length ? todoList.reverse() : []
      });
    } catch (e) {
      this.setState({
        todoData: []
      });
    }
  }

  handleCheckChange = (item: TodoItem) => () => {
    const data = {
      id: item.id,
      text: item.text,
      state: !item.state
    };
    storage.add(TODO_KEY, item.id, data);
    this.initTodoList();
  };

  showItemOptions = (item: TodoItem) => (e: any) => {
    e.stopPropagation();
    this.current = item;
    this.todoActionSheet.show();
  }

  changeModal = () => {
    if (this.state.isModalShown) {
      this.clearForm();
    }
    this.setState({
      isModalShown: !this.state.isModalShown
    });
  };

  clearForm = () => {
    this.setState({text: ''});
    this.current = undefined;
  };

  deleteItem () {
    if (!this.current) {
      return;
    }
    storage.delete(TODO_KEY, this.current.id);
    this.initTodoList();
    this.current = undefined;
  }

  selectSheet = (index: number) => {
    if (!this.current) {
      return;
    }
    switch (index) {
      case 0:
        this.setState({text: this.current.text});
        this.changeModal();
        break;
      case 1:
        this.deleteItem();
        break;
      case 2:
        this.current = undefined;
        break;
      default:
        break;
    }
  }

  makeToast (text) {
    const toastStyle = {
      container: {
        backgroundColor: '#2487DB',
        paddingTop: 25,
        paddingBottom: 15
      },
      text: {
        color: '#ffffff',
        fontWeight: 'bold',
        textAlign: 'center'
      }
    };
    this.setState({toast: {
      text,
      styles: toastStyle,
      duration: 1000
    }});
    setTimeout(() => {
      this.setState({toast: null});
    }, 1000);
  }

  saveTodo = () => {
    const text = this.state.text.trim();
    if (!text) {
      this.makeToast('内容不可为空');
      return;
    }
    const id = this.current !== undefined ? this.current.id : this.generateId();
    const data = {
      id,
      text,
      state: false
    };
    storage.add(TODO_KEY, id, data);
    this.initTodoList();
    this.changeModal();
    this.current = undefined;
  };

  render () {
    const rightText = (item: TodoItem) => (
      <Text
        onLongPress={this.showItemOptions(item)}
        onPress={this.handleCheckChange(item)}
        style={{...styles.rightText, textDecorationLine: item.state ? 'line-through' : 'none'}}>
        {item.text}
      </Text>
    );
    
    const todoItem = ({item, index}: {item: TodoItem, index: number}) => (
      <CheckBox
        checkedImage={<Image style={{width: 20, height: 20}} source={require('../assets/checked.png')}/>}
        unCheckedImage={<Image style={{width: 20, height: 20}} source={require('../assets/unchecked.png')}/>}
        style={{padding: 16}}
        onClick={this.handleCheckChange(item)}
        isChecked={item.state}
        rightTextView={rightText(item)}/>
    );

    const editForm = (
      <View style={styles.modalBackground}>
        <View style={{flex: 1}}>
          <TextInput
            multiline={true}
            style={styles.modalInput}
            onChangeText={(text) => this.setState({text})}
            value={this.state.text}/>
          <View style={styles.modalButtonContainer}>
            <Button 
              style={{color: 'red'}}
              onPress={this.changeModal}>取消</Button>
            <Button
              onPress={this.saveTodo}>保存</Button>
          </View>
        </View>
      </View>
    );

    return (
      <View>
        <FlatList
          data={this.state.todoData}
          keyExtractor={(item: TodoItem) => item.id + ''}
          renderItem={todoItem}/>
        <EditModal
          message={this.state.toast}
          isModalShown={this.state.isModalShown}
          editForm={editForm}
          dismiss={this.clearForm}/>
        <ActionSheet
          ref={o => this.todoActionSheet = o}
          options={['编辑', '删除', '取消']}
          cancelButtonIndex={2}
          onPress={this.selectSheet}/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  rightText: {
    marginLeft: 16,
    flex: 1,
    textAlign: 'center'
  },
  modalBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    height: 240, 
    width: Dimensions.get('window').width - 20, 
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingLeft: 20,
    paddingRight: 20
  },
  modalInput: {
    height: 120,
    backgroundColor: '#fff',
    paddingLeft: 20,
    paddingRight: 20
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingLeft: 10,
    paddingRight: 10
  },
  toast: {
    height: 10,
    textAlign: 'center'
  }
});

export default StackNavigator({Todo});
