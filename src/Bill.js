/**
 * Bill.js
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {Text, View, FlatList, Modal, Image, TextInput, StyleSheet, Dimensions, TouchableWithoutFeedback} from 'react-native';
import Button from 'react-native-button';
import { StackNavigator } from 'react-navigation';
import ActionSheet from 'react-native-actionsheet';
import AddButton from './AddButton';
import EditModal from './EditModal';
import storage from './storage';
import RadioForm from 'react-native-simple-radio-button';
import DatePicker from 'react-native-datepicker';
import dayjs from 'dayjs';

type Props = {
  navigation: any
};

type State = {
  billData: Array<BillItem>,
  isModalShown: boolean,
  type: number,
  date: string,
  time: string,
  count: number | string,
  text: string,
  toast: Toast | null
};

type Toast = {
  text: string,
  styles: object,
  duration: number
}

type BillItem = {
  id: number,
  date: string,
  count: number,
  desc: string
};

const BILL_KEY = 'billList';

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

class Bill extends Component<Props, State> {
  
  current: BillItem | typeof undefined;
  billActionSheet: ActionSheet;

  state = {
    billData: [{id: 1, date: '2018-06-23 12:42', count: 200, desc: '哈哈哈哈哈'}, {id: 2, date: '2019-08-24 12:42', count: -300, desc: '哈哈哈哈哈'}],
    isModalShown: false,
    date: dayjs().format('YYYY-MM-DD'),
    time: dayjs().format('HH:mm'),
    type: -1,
    count: '',
    text: ''
  };

  static navigationOptions = ({ navigation }) => {
    return {
      title: '收支账单',
      headerRight: <AddButton navigation={navigation}/>
    }
  };

  generateId () : number {
    return this.state.billData.length ? this.state.billData[0].id + 1 : 1000;
  }

  componentDidMount () {
    this.props.navigation.setParams({
      changeModal: this.changeModal
    });
    this.initBillList();
  }

  async initBillList () {
    try {
      const billData = await storage.selectList(BILL_KEY);
      this.setState({
        billData: billData.length ? billData.reverse() : []
      });
    } catch (e) {
      this.setState({
        billData: []
      });
    }
  }

  showItemOptions = (item: BillItem) => (e: any) => {
    e.stopPropagation();
    this.current = item;
    this.billActionSheet.show();
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
    this.setState({
      date: dayjs().format('YYYY-MM-DD'),
      time: dayjs().format('HH:mm'),
      type: -1,
      count: '',
      text: ''
    });
    this.current = undefined;
  };

  deleteItem () {
    if (!this.current) {
      return;
    }
    storage.delete(BILL_KEY, this.current.id);
    this.initBillList();
    this.current = undefined;
  }

  selectSheet = (index: number) => {
    if (!this.current) {
      return;
    }
    switch (index) {
      case 0:
        console.log(this.current);
        const {count, date, desc} = this.current;
        this.setState({
          type: count <= 0 ? -1 : 1,
          date: date.split(' ')[0],
          time: date.split(' ')[1],
          count: Math.abs(count),
          text: desc
        });
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

  saveBill = () => {
    const count = (this.state.count + '').trim();
    if (!count) {
      this.makeToast('金额不可为空');
      return;
    }
    if (isNaN(+count) || +count <= 0) {
      this.makeToast('金额不合法');
      return;
    }
    const id = this.current !== undefined ? this.current.id : this.generateId();
    const data = {
      id,
      date: this.state.date + ' ' + this.state.time,
      count: this.state.type * (+count),
      desc: this.state.text ? this.state.text.trim() : ''
    };
    storage.add(BILL_KEY, id, data);
    this.initBillList();
    this.changeModal();
    this.current = undefined;
  }

  render () {
    const billItem = ({item, index}) => (
      <TouchableWithoutFeedback onLongPress={this.showItemOptions(item)}>
        <View style={styles.itemContainer}>
          <View style={{...styles.textContainer, backgroundColor: item.count <= 0 ? 'blue' : 'red'}}>
            <Text style={styles.typeText}>{item.count <= 0 ? '支' : '收'}</Text>
          </View>
          <View style={{marginLeft: 16}}>
            <View style={styles.countContainer}>
              <Text style={{color: '#aaa', fontSize: 20}}>{Math.abs(item.count)} 元</Text>
              <Text>{item.date}</Text>
            </View>
            <Text style={{marginTop: 8}}>{item.desc}</Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );

    const editForm = (
      <View style={styles.modalBackground}>
        <View style={{flex: 1}}>
          <Text style={styles.editTitle}>记一笔</Text>
          <View style={styles.formItem}>
            <Text style={{marginRight: 20}}>类型</Text>
            <RadioForm
              radio_props={[{label: '支出', value: -1 }, {label: '收入', value: 1 }]}
              labelStyle={{marginRight: 20}}
              buttonSize={10}
              formHorizontal={true}
              initial={this.state.type <=0  ? 0 : 1}
              onPress={type => this.setState({type})}/>
          </View>
          <View style={styles.formItem}>
            <Text style={{marginRight: 20}}>时间</Text>
            <DatePicker
              style={{width: 100}}
              date={this.state.date}
              mode="date"
              format="YYYY-MM-DD"
              confirmBtnText="确定"
              cancelBtnText="取消"
              showIcon={false}
              onDateChange={date => this.setState({date})}/>
            <DatePicker
              style={{width: 100}}
              date={this.state.time}
              mode="time"
              format="HH:mm"
              confirmBtnText="确定"
              cancelBtnText="取消"
              showIcon={false}
              onDateChange={time => this.setState({time})}/>
          </View>
          <View style={styles.formItem}>
            <Text style={{marginRight: 20}}>金额</Text>  
            <TextInput
              keyboardType="number-pad"
              style={styles.countEdit}
              onChangeText={count => this.setState({count})}
              value={this.state.count + ''}/>
            <Text>元</Text>
          </View>
          <View style={styles.formItem}>
            <Text style={{marginRight: 20}}>详情</Text>
            <TextInput
              multiline={true}
              style={styles.descEdit}
              onChangeText={text => this.setState({text})}
              value={this.state.text}/>
          </View>
          <View style={styles.modalButtonContainer}>
            <Button 
              style={{color: 'red'}}
              onPress={this.changeModal}>取消</Button>
            <Button
              onPress={this.saveBill}>保存</Button>
          </View>
        </View>
      </View>
    );

    return (
      <View>
        <FlatList
          data={this.state.billData}
          keyExtractor={(item: BillItem) => item.id + ''}
          renderItem={billItem}/>
        <EditModal
          message={this.state.toast}
          isModalShown={this.state.isModalShown}
          editForm={editForm}
          dismiss={this.clearForm}/>
        <ActionSheet
          ref={o => this.billActionSheet = o}
          options={['编辑', '删除', '取消']}
          cancelButtonIndex={2}
          onPress={this.selectSheet}/>  
      </View>
    );
  }
}

const styles = StyleSheet.create({
  itemContainer: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center'
  },
  textContainer: {
    width: 30,
    height: 30,
    borderRadius: 15
  },
  countContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: Dimensions.get('window').width - 78
  },
  typeText: {
    lineHeight: 30,
    textAlign: 'center',
    color: 'white',
    fontWeight: '900'
  },
  modalBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    height: 440,
    width: Dimensions.get('window').width - 20,
    flexDirection: 'row',
    padding: 10
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
    paddingLeft: 10,
    paddingRight: 10
  },
  formItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10
  },
  editTitle: {
    textAlign: 'center',
    fontSize: 20,
    margin: 20
  },
  countEdit: {
    backgroundColor: '#eee',
    width: 150,
    height: 30,
    borderRadius: 5,
    textAlign: 'center',
    padding: 0
  },
  descEdit: {
    backgroundColor: '#eee',
    width: 200,
    height: 80,
    borderRadius: 5,
    padding: 0
  }
});

export default StackNavigator({Bill});
