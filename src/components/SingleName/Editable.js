import { Component } from 'react'

class Editable extends Component {
  state = {
    editing: false,
    newValue: ''
  }

  startEditing = () => this.setState({ editing: true })
  stopEditing = () => this.setState({ editing: false })

  render() {
    return this.props.children({
      editing: this.state.editing,
      newValue: this.state.newValue,
      startEditing: this.startEditing,
      stopEditing: this.stopEditing
    })
  }
}

export default Editable
