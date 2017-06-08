function autocomplete(input, latinput, lnginput) {
  if(!input) return
  const dropdown = new google.maps.places.Autocomplete(input);
  dropdown.addListener('place_changed', function() {
    const place = dropdown.getPlace()
    latinput.value = place.geometry.location.lat()
    lnginput.value = place.geometry.location.lng()
  })
  input.on('keydown', (e) => {
    if(e.keyCode === 13) e.preventDefault()
  })
} 

export default autocomplete
