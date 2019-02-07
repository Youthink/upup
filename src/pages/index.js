import React             from 'react';
import PropTypes         from 'prop-types';

import '../styles/index.css';

class HomePage extends React.PureComponent {

  static defaultProps = {
  };

  constructor(props) {
    super(props);

    this.state = {
      a : 'a'
    }
  }

  componentDidMount() {
  }

  render() {
    return(
        <div>这是首页</div>
    );
  }
}

HomePage.propTypes = {
  a: PropTypes.object,
  c: PropTypes.object.isRequired,
  o: PropTypes.func
};

export default HomePage;
