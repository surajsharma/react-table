import React from "react";
import "./App.css";
import ReactTable from "react-table";
import "react-table/react-table.css";

class ShipmentsView extends React.Component {
  constructor(props) {
    super(props);
    this.state = { data: this.props.data };
  }

  componentDidMount() {
    this.setState({
      data: this.props.data
    });
  }

  render() {
    const cols = [
      {
        Header: "Shipment ID",
        accessor: "id",
        filterable: true
      },
      {
        Header: "Name",
        accessor: "name"
      },
      {
        Header: "Origin",
        accessor: "origin"
      },
      {
        Header: "Destination",
        accessor: "destination"
      },
      {
        Header: "mode",
        accessor: "mode"
      }
    ];

    if (this.props.data === null) {
      return <p>Loading...</p>;
    } else {
      return (
        <div>
          <ReactTable
            showPaginationTop={true}
            showPaginationBottom={false}
            data={this.props.data}
            columns={cols}
            getTdProps={(state, rowInfo, column, instance) => {
              return {
                onClick: (e, handleOriginal) => {
                  this.props.handleRowClick(rowInfo.original);

                  // IMPORTANT! React-Table uses onClick internally to trigger
                  // events like expanding SubComponents and pivots.
                  // By default a custom 'onClick' handler will override this functionality.
                  // If you want to fire the original onClick handler, call the
                  // 'handleOriginal' function.

                  if (handleOriginal) {
                    handleOriginal();
                  }
                }
              };
            }}
          />
        </div>
      );
    }
  }
}

class ShipmentDetails extends React.Component {
  handleUpdate = name => {
    this.props.handleUpdate(name);
  };

  render() {
    const header = this.props.data || "Please click on a row";
    const updateButton = (
      <button onClick={() => this.handleUpdate(header.name)}>Update</button>
    );
    let cargo,
      services = null;
    header.cargo
      ? (cargo = header.cargo.map((cargo, index) => {
          return (
            <div key={index}>
              <li>
                {cargo.type}
                {" : "}
                {cargo.description ? "  " + cargo.description : ""}
                {cargo.volume ? "  " + cargo.volume : ""}
              </li>
            </div>
          );
        }))
      : (cargo = null);

    header.services
      ? (services = header.services.map((service, index) => {
          return (
            <div key={index}>
              <li>
                {service.type}
                {service.value ? ": " + service.value : ""}
              </li>
            </div>
          );
        }))
      : (services = null);

    return (
      <div>
        <p>{"Details for shipment ID : " + header.id}</p>
        <hr />
        <textarea
          className="shipment-name"
          onChange={evt => this.props.handleNameChange(evt)}
          value={this.props.name}
          defaultValue="Please select an item from the table"
        />
        <br />
        {updateButton}
        <p>{"Shimpent Type:" + header.type}</p>
        <p>{"User ID:" + header.userId}</p>
        <p>{"Shipment mode: " + header.mode}</p>
        <p>{"Origin: " + header.origin}</p>
        <p>{"Destination: " + header.destination}</p>
        <p>Cargo</p>
        <ul>{cargo}</ul>
        <p>Services</p>
        <ul>{services}</ul>
        <h3>{"Total: " + header.total}</h3>
        <h4>{"Status: " + header.status}</h4>
      </div>
    );
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null,
      selectedRow: null,
      name: "",
      id: null,
      cargo: [],
      mode: null,
      type: null,
      destination: null,
      origin: null,
      services: [],
      total: null,
      status: null,
      userId: null
    };
  }

  handleRowClick = rowInfo => {
    this.setState({
      selectedRow: rowInfo,
      id: rowInfo.id,
      cargo: rowInfo.cargo,
      mode: rowInfo.mode,
      type: rowInfo.type,
      destination: rowInfo.destination,
      origin: rowInfo.origin,
      services: rowInfo.services,
      total: rowInfo.total,
      status: rowInfo.status,
      userId: rowInfo.userId,
      name: rowInfo.name
    });
  };

  handleNameChange = evt => {
    this.setState({ name: evt.target.value });
  };

  handleUpdate = name => {
    let url = "http://localhost:3000/shipments/";

    let shipment = {
      id: this.state.id,
      cargo: this.state.cargo,
      mode: this.state.mode,
      type: this.state.type,
      destination: this.state.destination,
      origin: this.state.origin,
      services: this.state.services,
      total: this.state.total,
      status: this.state.status,
      userId: this.state.userId,
      name: this.state.name
    };

    console.log(shipment);
    this.state.data.find(e => {
      if (e.id === shipment.id && this.state.data !== null) {
        console.log("put request here", shipment);
        fetch(url + e.id, {
          method: "PUT", // *GET, POST, PUT, DELETE, etc.
          headers: {
            "Content-Type": "application/json"
            // "Content-Type": "application/x-www-form-urlencoded",
          },
          body: JSON.stringify(shipment)
        })
          .then(res => console.log(res))
          .then(data => {
            console.log(data);
          })
          .then(window.location.reload())
          .catch(error => console.log(error));
      }

      return 0;
    });
  };

  componentDidMount() {
    let url = "http://localhost:3000/shipments";

    fetch(url, {
      method: "GET"
    })
      .then(resp => resp.json())
      .then(data => {
        this.setState({ data: data }, () => {
          console.log(data.name);
        });
      });
  }

  render() {
    return (
      <div className="App">
        <div className="table">
          <ShipmentsView
            data={this.state.data}
            handleRowClick={this.handleRowClick}
          />
        </div>
        <div className="details">
          {this.state.id ? (
            <ShipmentDetails
              data={this.state.selectedRow}
              handleUpdate={this.handleUpdate}
              handleNameChange={this.handleNameChange}
              name={this.state.name}
            />
          ) : <p>Please select a shipment from the table</p>}
        </div>
      </div>
    );
  }
}

export default App;
