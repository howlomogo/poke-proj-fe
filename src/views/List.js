import _ from 'lodash'
import React, { useState, useEffect } from 'react';
import axios from 'axios'

// Components
import Loader from '../components/Loader'
import Pagination from '../components/Pagination'
import ListItem from '../components/ListItem'
import ListFilters from '../components/ListFilters'

const List = () => {
  const defaultPageNumber = 1

  const [resultsLoading, setResultsLoading] = useState(false)

  const [selectedFilters, setSelectedFilters] = useState({
    types: []
    //...Other filters
  })

  const [showPerPage, setShowPerPage] = useState("12")

  const [resultsData, setResultsData] = useState({
    results: [],
    pagination: [],
    page: defaultPageNumber,
    total: 0
  })

  // ComponentDidMount
  useEffect(() => {
    setup()
  }, [])

  const setup = async () => {
    await getResults(defaultPageNumber)
  }

  /**
   * Calls endpoint which will get and return array of pokemon results including pokemon info
   * @param limit 10/20/30 - resultsPerPage
   * @param pageNumber - Dont worry about this yet
   * @param filters [{types: [], habitat: []}] - selectedFilters
   * Currently picking these off state, but we could use url params for deep linking, we would need to do some rework for that however
   */
  const getResults = async (page) => {
    setResultsLoading(true)
    const params = {
      showPerPage: showPerPage,
      filters: selectedFilters,
      pageNumber: page
    }
    
    // http://localhost:3000/results
    await axios.get('https://poke-proj-be.herokuapp.com/results', { params })
      .then(res => {
        setResultsData({
          results: res.data.results,
          pagination: res.data.pagination,
          page: page,
          total: res.data.total
        })
      })
    
      setResultsLoading(false)
  }

  // Updates the selectedFilters state to add / remove any added filters
  const handleFilterChange = (e, filterKey) => {
    let selectedFiltersClone = _.cloneDeep(selectedFilters)

    // Return whether or not the filter is already selected
    const filterPosition = selectedFiltersClone[filterKey].indexOf(e.target.id)

    if (filterPosition === -1) {
      selectedFiltersClone[filterKey].push(e.target.id)
    } else {
      selectedFiltersClone[filterKey].splice(filterPosition, 1)
    }

    setSelectedFilters(selectedFiltersClone)
  }
  
  return (
    <React.Fragment>
      {/* Filters */}
      <ListFilters
        getResults={getResults}
        selectedFilters={selectedFilters}
        handleFilterChange={handleFilterChange}
        setShowPerPage={setShowPerPage}
        showPerPage={showPerPage}
        defaultPageNumber={defaultPageNumber}
        total={resultsData.total}
        showingPerPage={_.get(resultsData, 'results.length', '0')} // Bit hacky here but basically this is the returned showing per page rather than the selected show per page
      />

      <div className="container mx-auto mt-8">
        {/* Loader */}
        {resultsLoading ? (
          <Loader />
        ) : (
          <React.Fragment>
            {/* Results */}
            {_.get(resultsData, 'results.length', 0) > 0 &&
              <div className="flex flex-wrap mb-10">
                {resultsData.results.map(pokemon => {
                  return (
                    <ListItem
                      key={pokemon.id}
                      pokedexNumber={pokemon.pokedexNumber}
                      name={pokemon.name}
                      types={pokemon.types}
                      image={pokemon.image}
                    />
                  )
                })}
              </div>
            }
          </React.Fragment>
        )}

        {!resultsLoading && _.get(resultsData, 'results.length', 0) < 1 &&
          <h1 className="text-center text-xl mb-8">No Pokemon were found</h1>
        }

        {/* Pagination */}
        <Pagination
          getResults={getResults}
          resultsData={resultsData}
          resultsLoading={resultsLoading}
        />
      </div>
    </React.Fragment>
  )
}

export default List