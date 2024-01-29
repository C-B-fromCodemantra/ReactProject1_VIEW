// import React, {useState} from 'react';
// import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, useMutation, gql} from '@apollo/client';
// import {configureStore, createSlice} from '@reduxjs/toolkit';
// import { useSelector, useDispatch, Provider } from 'react-redux'; 
// import { createStore, applyMiddleware } from 'redux';

// // const initialState = {
// //   tableData: [],
// // };

// //redux store
// const dataSlice = createSlice({
//   name: 'data',
//   initialState: { tableData: [] },
//   reducers: {
//     setTableData: (state, action) => {
//       state.tableData = action.payload;
//     },
//   },
// });

// const store = configureStore({ reducer: dataSlice.reducer });

// const GET_TABLE_DATA = gql`
//   query GetTableData($tableName: String!, $columnName: String!, $uniqueColumn: String!) {
//     getTableData(tableName: $tableName, columnName: $columnName, uniqueColumn: $uniqueColumn) {
//       id
//       city_name
//     }
//   }
// `;

// const UPDATE_TABLE_DATA = gql`
//   mutation UpdateTableData($tableName: String!, $columnName: String!, $uniqueColumn: String!, $userInput: String!) {
//     updateTableData(tableName: $tableName, columnName: $columnName, uniqueColumn: $uniqueColumn, userInput: $userInput) {
//       id
//       city_name
//     }
//   }
// `;

// const client = new ApolloClient({
//   uri: 'http://localhost:4000/graphql',
//   cache: new InMemoryCache(),
// });

// function App() {
//   // Redux state and actions
//   // const tableData = useSelector((state) => state.data.tableData) ;
//   const dispatch = useDispatch();

//   const [tableName, setTableName] = useState('');
//   const [columnName, setColumnName] = useState('');
//   const [uniqueColumn, setUniqueColumn] = useState('');
//   const [userInput, setUserInput] = useState('');

//   const { loading, error, data, refetch } = useQuery(GET_TABLE_DATA, {
//     variables: { tableName, columnName, uniqueColumn },
//   });
//   const [updateTableData] = useMutation(UPDATE_TABLE_DATA);

//   const handleFetchData = () => {
//     refetch().then(({ data }) => dispatch(dataSlice.actions.setTableData(data.getTableData)));
//   };

//   const handleUpdateData = () => {
//     updateTableData({ variables: { tableName, columnName, uniqueColumn, userInput } })
//       .then(() => refetch())
//       .then(({ data }) => dispatch(dataSlice.actions.setTableData(data.updateTableData)));
//   };

//   return (
//     <div>
//       <div>
//         <input
//           type="text"
//           placeholder="Table Name"
//           value={tableName}
//           onChange={(e) => setTableName(e.target.value)}
//         />
//         <input
//           type="text"
//           placeholder="Column Name"
//           value={columnName}
//           onChange={(e) => setColumnName(e.target.value)}
//         />
//         <input
//           type="text"
//           placeholder="Unique Column"
//           value={uniqueColumn}
//           onChange={(e) => setUniqueColumn(e.target.value)}
//         />
//         <button onClick={handleFetchData}>Fetch Data</button>
//       </div>
//       <div>
//         <table>
//           <thead>
//             <tr>
//               <th>ID</th>
//               <th>City Name</th>
//             </tr>
//           </thead>
//           <tbody>
//             {loading ? (
//               <tr>
//                 <td colSpan="2">Loading...</td>
//               </tr>
//             ) : error || !data.getTableData ? (
//               <tr>
//                 <td colSpan="2">Error fetching data</td>
//               </tr>
//             ) : (
//               data.getTableData.map((row) => (
//                 <tr key={row.id}>
//                   <td>{row.id}</td>
//                   <td>{row.city_name}</td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//         <input
//           type="text"
//           placeholder="User Input"
//           value={userInput}
//           onChange={(e) => setUserInput(e.target.value)}
//         />
//         <button onClick={handleUpdateData}>Update Data</button>
//       </div>
//     </div>
//   );
// }
// export default function AppWrapper() {
//   return (
//     <ApolloProvider client={client}>
//       <Provider store={store}>
//         <App />
//       </Provider>
//     </ApolloProvider>
//   );
// }

import React, { useState } from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider, useMutation, gql } from '@apollo/client';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import Screen1 from './Screen1';
import Screen2 from './Screen2';

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
  cache: new InMemoryCache(),
});

const CREATE_TABLE_ROW = gql`
  mutation CreateTableRow($city_name: String!) {
    createTableRow(city_name: $city_name) {
      id
      city_name
      userInput
    }
  }
`;

const UPDATE_TABLE_DATA = gql`
  mutation UpdateTableData($id: Int!, $city_name: String!, $userInput: String!) {
    updateTableData(id: $id, city_name: $city_name, userInput: $userInput) {
      id
      city_name
      userInput
    }
  }
`;

function App() {
  const [isScreen1, setIsScreen1] = useState(true);
  const [tableData, setTableData] = useState([]);

  const [createTableRow] = useMutation(CREATE_TABLE_ROW);
  const [updateTableData] = useMutation(UPDATE_TABLE_DATA);

  const handleCreateRow = (cityName) => {
    return createTableRow({ variables: { city_name: cityName } })
      .then(({ data }) => {
        setTableData([...tableData, data.createTableRow]);
        return data.createTableRow;
      });
  };

  const handleUpdateData = (id, city_name, userInput) => {
    return updateTableData({ variables: { id, city_name, userInput } })
      .then(({ data }) => {
        setTableData((prevTableData) => {
          return prevTableData.map((row) => {
            if (row.id === id) {
              return { ...row, userInput };
            }
            return row;
          });
        });
        return data.updateTableData;
      });
  };

  return (
    <Router>
      <div>
        <Route path="/" exact>
          {isScreen1 ? (
            <Screen1
              handleCreateRow={handleCreateRow}
              setTableData={setTableData}
              setIsScreen1={setIsScreen1}
            />
          ) : null}
          <button onClick={() => setIsScreen1(!isScreen1)}>Toggle Screen</button>
        </Route>
        <Route path="/screen2" exact>
          <Screen2
            tableData={tableData}
            handleUpdateData={handleUpdateData}
          />
        </Route>
      </div>
    </Router>
  );
}

export default function AppWrapper() {
  return (
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  );
}

