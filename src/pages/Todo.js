import React, { Component } from 'react';
import db                   from '../components/db';
import { isToday }          from '../helpers';
import cn                   from 'classnames';
import Calendar             from 'rc-calendar';
import zhCN                 from 'rc-calendar/lib/locale/zh_CN';
import moment               from 'moment';
import 'moment/locale/zh-cn';
import 'rc-calendar/assets/index.css';
import '../styles/Todo.css';


import { Controlled as CodeMirror }   from 'react-codemirror2';

import 'codemirror/lib/codemirror.css';
import 'hypermd/mode/hypermd.css';
import 'hypermd/theme/hypermd-light.css';
import 'codemirror/lib/codemirror';
import 'hypermd/core';
import 'hypermd/mode/hypermd';
import 'hypermd/addon/hide-token';
import 'hypermd/addon/cursor-debounce';
import 'hypermd/addon/fold';
import 'hypermd/addon/read-link';
import 'hypermd/addon/click';
import 'hypermd/addon/hover';
import 'hypermd/addon/mode-loader';
import 'hypermd/addon/table-align';
import 'codemirror/addon/display/placeholder';

const now = moment('00:00:00', 'HH:mm:ss').locale('zh-cn').utcOffset(8);

const stores = [
  {name:'todos', option: {autoIncrement: true, keyPath: 'id'}},
  {name:'tags', option: {autoIncrement: true, keyPath: 'id'}, index: [{name: 'title', item: 'unique', value: true}]},
  {name:'articles', option: {autoIncrement: true, keyPath: 'id'}, index: [{name: 'parentId', item: 'unique', value: true}]},
  {name:'days', option: {autoIncrement: true, keyPath: 'id'}, index: [{name: 'date', item: 'unique', value: true}]}
];

const MyDB = new db('upup', 10, stores);

MyDB.open((e) => {
  window.console.log(e);
});

const options = {
  mode: 'hypermd',
  theme: 'hypermd-light',
  lineNumbers: false,
  hmdFold: {
    image: true,
    link: true,
    math: true,
  },
  hmdHideToken: true,
  hmdCursorDebounce: true,
  hmdPaste: true,
  hmdClick: true,
  hmdHover: true,
  hmdTableAlign: true
};


class App extends Component {

  static defaultProps = {
  };

  constructor(props) {
    super(props);

    this.state = {
      content: '',
      currentTag: null,
      currentSelectDate: null,
      currentEmoji: null,
      needEditItem: null,
      currentTODOSubArticle: null,
      currentTODOSubArticleValue: '',
      currentSelectDateArticleValue: '',
      day: null,
      list: [],
      tags: []
    }
  }

  componentDidMount() {
    window.setTimeout(
      () => {
        this.fetchTodos()
        this.fetchTags()
      }, 500
    );
  }

  fetchTodos() {
    MyDB.getAll('todos', (results) => {
      this.setState({list: results});
    });
  }

  fetchTags() {
    MyDB.getAll('tags', (results) => {
      this.setState({tags: results});
    });
  }

  render() {
    const { list, tags, currentTag, currentSelectDate } = this.state;
    if(!list) return null;
    return (
      <div className="App">
        <div className="ui visible vertical inverted menu sidebar">
          <div className="item">
            <div className="header" onClick={() => this.changeTag()}>所有</div>
          </div>
          <div className="item">
            <div className="header" onClick={() => this.calendarSelect(moment())}>今天</div>
          </div>
          <div className="item">
            <div className="header">标签</div>
            <div className="menu">
              {tags.map((o, i) => (
                  <li className="ui item left icon" key={i}
                    onClick={() => this.changeTag(o)}
                  >
                    {o.title}
                  <i className="tag icon"></i>
                </li>
                ))
              }
            </div>
          </div>
          <div className="item calendar">
            <div className="header">日历</div>
            <Calendar
              locale={zhCN}
              formatter='YYYY-MM-DD'
              defaultValue={now}
              showDateInput={false}
              onSelect={this.calendarSelect}
            />
          </div>
        </div>
        <section className="main-page ui form">
          <header>
            <h1 className="ui header">
              {currentTag ?
                currentTag : (currentSelectDate ?
                (isToday(currentSelectDate) ?
                '今天' :
                this.unixToDate(currentSelectDate, 'YYYY年M月D日')) :
                '所有')
              }
            </h1>
            <form onSubmit={this.submit.bind(this)}>
              <div className="ui left icon input">
                <input type="text"
                  value={this.state.content}
                  onChange={this.inputChange.bind(this)}
                  placeholder="回车 添加新 Todo"
                />
                <i className="plus icon"></i>
              </div>
            </form>
          </header>
          <div className="grouped fields">
            {this.fliterTODO(list, currentTag, currentSelectDate)}
          </div>
        </section>
        <section className="right-part">
          <div className="right-content">
            {this.renderRightContnet()}
          </div>
        </section>
      </div>
    );
  }

  renderRightContnet() {
    const { currentSelectDate, currentTODO, currentTODOSubArticleValue,
      currentSelectDateArticleValue, currentEmoji } = this.state;
    if (currentTODO) {
      return(
        <div className="sub-article">
          <h1 className="article-title">{currentTODO && currentTODO.title}</h1>
          <CodeMirror
            value={currentTODOSubArticleValue}
            className="article-textarea"
            options={options}
            onBeforeChange={(editor, data, value) => this.setState({currentTODOSubArticleValue: value})}
            onBlur={this.saveSubArticle.bind(this)}
          />
        </div>
      );
    }
    if(currentSelectDate) {
      const dateTitle = isToday(currentSelectDate) ? '今天' :
        this.unixToDate(currentSelectDate, 'YYYY年M月D日');
      return(
        <div className="one-day">
          <h1 className="day-title">我的{dateTitle}</h1>
          <h2>总结一下</h2>
          <div className="ui mini form">
            <div className="field">
              <select className="ui dropdown" value={currentEmoji} onChange={this.selectDayEmoji.bind(this)}>
                <option value="">选择一个能表达今天状态的表情</option>
                <option value="good"><span role="img" aria-label="crown">👑 </span></option>
                <option value="medium"><span role="img" aria-label="star">⭐</span></option>
                <option value="bad"><span role="img" aria-label="pig">🐖</span></option>
              </select>
            </div>
          </div>
          <CodeMirror
            value={currentSelectDateArticleValue}
            className="day-textarea"
            options={{...options, placeholder: '技术，工作，生活，自律等方面简单的总结一下吧...'}}
            onBeforeChange={(editor, data, value) => this.setState({currentSelectDateArticleValue: value})}
            onBlur={this.saveDaysArticle.bind(this)}
          />
        </div>
      );
    }
  }

  selectDayEmoji(o) {
    this.setState({currentEmoji: o.target.value});
  }

  fliterTODO(list, currentTag, currentSelectDate) {
    const todayIsSelectDate = (o) => {
      return this.unixToDate(o.joinDateTime, 'YYYYMD')
        === this.unixToDate(currentSelectDate, 'YYYYMD')
    };
    //if 的形式不好，之后重构一下
    if (currentTag) {
      return list.map((o, i) => {
        if(o.tag === currentTag) {
          return this.renderTODOItem(o, i);
        }
        return null;
      });
    }

    if(currentSelectDate) {
      return list.map((o, i) => {
        if (todayIsSelectDate(o)) {
          return this.renderTODOItem(o, i);
        }
        return null;
      });
    }

    return list.map((o, i) => {
      return this.renderTODOItem(o, i);
    });
  }

  renderTODOItem(o, i) {
    const { needEditItem, editingTODO } = this.state;
    let date;
    if (o.joinDateTime) {
      const dateFormat = new Date(o.joinDateTime).getFullYear() === moment().year() ?
        'M月D日' : 'YYYY年M月D日';
      date = this.unixToDate(o.joinDateTime, dateFormat);
    } else {
      date = '未设置';
    }
    return(
      <li key={i} className="field hover-show">
        <span className="ui checked checkbox">
          <input type="checkbox" checked={o.status === 'COMPLATE'}
            onChange={() =>this.checkboxChange(o)}
          />
          <label className={cn({'first-three': i < 3, 'complate-status': o.status === 'COMPLATE'})}>
            {o.tag ? <span className="highlight-tag">{'#' + o.tag + ' '}</span> : null}
            { needEditItem && needEditItem.title === o.title ?
            <input
              className="ui small edit-todo-input"
              value={editingTODO}
              onChange={(e) => {this.setState({editingTODO: e.target.value})}}
              onKeyPress={this.saveEdit.bind(this)}
              onBlur={this.saveEdit.bind(this)}
            />
            :
            <span onClick={() => {this.editable(o)}}>{o.title}</span>
            }
          </label>
        </span>
        <span className="datetime">{date}</span>
        <span className="delete-btn" onClick={() => {this.delete(o)}}>
          <i className="times icon"></i>
        </span>
      </li>
    );
  }

  unixToDate(unix, format) {
    return moment.unix(unix / 1000).format(format);
  }

  inputChange(e) {
    this.setState({content: e.target.value});
  }

  saveDaysArticle() {
    const { currentSelectDate, currentSelectDateArticleValue, day, currentEmoji } = this.state;
    const date = moment(currentSelectDate).valueOf();
    console.log(currentEmoji);
    let article;
    if (day) {
      //edit mode
      article = day;
      article.content = currentSelectDateArticleValue;
      article.mood = currentEmoji;
    } else {
      //add mode
      article = {
        content: currentSelectDateArticleValue,
        date: date,
        mood: currentEmoji
      };
    }
    MyDB.add('days', article, (e) => {
      window.console.log(e);
    });
  }

  saveSubArticle() {
    const { currentTODOSubArticle, currentTODO, currentTODOSubArticleValue } = this.state;
    let article;
    if (currentTODOSubArticle) {
      //edit mode
      article = currentTODOSubArticle;
      article.value = currentTODOSubArticleValue;
    } else {
      //add mode
      article = {
        value: currentTODOSubArticleValue,
        parentId: currentTODO.id
      };
    }
    MyDB.add('articles', article, (e) => {
      window.console.log(e);
    });
  }

  saveEdit(e) {
    if (e.key === 'Enter' || e.key === undefined) {
      const { needEditItem } = this.state;
      const title = e.target.value;
      const todo = needEditItem;
      todo.title = title;
      MyDB.add('todos', todo, (e) => {
        window.console.log(e);
      });
      this.setState({needEditItem: null});
    }
  }

  editable(o) {
    this.setState({
      needEditItem: o,
      currentTODO: o,
      editingTODO: o.title
    });

    MyDB.indexBy('articles', 'parentId', o.id, (result) => {
      this.setState({
        currentTODOSubArticle: result,
        currentTODOSubArticleValue: (result && result.value) || '',
      });
    });
  }

  calendarSelect = (dateTime) => {
    this.setState({
      currentSelectDate: dateTime,
      currentTag: null,
      currentTODO: null
    });
    const date = moment(dateTime).valueOf();
    MyDB.indexBy('days', 'date', date, (result) => {
      this.setState({
        day: result,
        currentSelectDateArticleValue: (result && result.content) || '',
        currentEmoji: (result && result.mood) || ''
      });
    });
  }

  changeTag(o) {
    let tag = null;
    if(o) {
      tag = o.title;
    }
    this.setState({
      currentTag: tag,
      currentSelectDate: null
    });
  }

  checkboxChange = (o) => {
    const todo = o;
    if(todo.status !== 'COMPLATE') {
      todo.status = 'COMPLATE';
      todo.complateDateTime = Date.parse(new Date());
    } else {
      todo.status = 'INIT';
      todo.complateDateTime = undefined;
    }

    MyDB.add('todos', todo, (e) => {
      window.console.log(e);
      this.fetchTodos();
    });
  }

  delete(o) {
    MyDB.remove('todos', o.id, () => {
      this.fetchTodos();
    });
  }

  submit(e) {
    e.preventDefault();
    let inputValue = this.state.content;
    const { currentTag } = this.state;
    const matchArr = inputValue.match(/#(.*)\s/);
    let tag;
    if(matchArr) {
      const match = matchArr[0];
      inputValue = inputValue.slice(match.length);
      const item = match.slice(1, match.length-1).trim();
      tag = {title: item};
      MyDB.add('tags', tag, (e) => {
        this.fetchTags();
      });
    };
    this.setState({content: ''});

    const joinDateTime = () => {
      if(this.state.currentSelectDate) {
        return moment(this.state.currentSelectDate).valueOf();
      }
      return null;
    }

    const todo = {
      title: inputValue,
      joinDateTime: joinDateTime(),
      complateDateTime: Date.parse(new Date()),
      status: 'INIT',
      tag: (tag && tag.title) || currentTag || ''
    };

    MyDB.add('todos', todo, (e) => {
      window.console.log(e);
      this.fetchTodos();
    });
  }

}

App.propTypes = {
  /* a: PropTypes.object,
  c: PropTypes.object.isRequired,
o: PropTypes.func
   */
};

export default App;


