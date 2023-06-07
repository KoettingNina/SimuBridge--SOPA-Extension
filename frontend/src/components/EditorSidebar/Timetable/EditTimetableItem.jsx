import { Button, FormControl, FormLabel, Select, Box, Stack } from '@chakra-ui/react';


const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]; //TODO duplicate
const hours = Array.from({ length: 24 }, (_, i) => i);

const EditTimetableItem = ({ currentTimetable, getData, currentTimetableItem, setCurrentTimetableItem }) => {

  function handleInputChange(resource) {
    const target = resource.target;
    const value = target.value;
    const name = target.name;
    currentTimetableItem[name] = value;
    getData().saveCurrentScenario();
  }

  function deleteItem() {
    const itemToDelete = currentTimetableItem;
    setCurrentTimetableItem(undefined);
    currentTimetable.timeTableItems = currentTimetable.timeTableItems.filter(timetableItem => timetableItem !== itemToDelete);
    getData().saveCurrentScenario();
  }

  return (
    <>
      <Box w="100%">
        <Stack gap="2">

          <FormControl>
            <FormLabel>Startweekday:</FormLabel>
            <Select value={currentTimetableItem.startWeekday} bg="white" name="startWeekday" onChange={(event) => handleInputChange(event)} >
              {days.map((day, index) => {
                return <option value={day}>{day}</option>
              })}
            </Select>
          </FormControl>

          <FormControl >
            <FormLabel>Endweekday:</FormLabel>
            <Select value={currentTimetableItem.endWeekday} bg="white" name="endWeekday" onChange={(event) => handleInputChange(event)} >
              {days.map((day, index) => {
                return <option value={day}>{day}</option>
              })}
            </Select>
          </FormControl>

          <FormControl >
            <FormLabel>Starttime:</FormLabel>
            <Select placeholder={currentTimetableItem.startTime + ":00"} bg="white" name="startTime" onChange={(event) => handleInputChange(event)} >
              {hours.map((hour, index) => {
                return <option value={hour}>{hour}:00</option>
              })}
            </Select>
          </FormControl>

          <FormControl >
            <FormLabel>Endtime:</FormLabel>
            <Select placeholder={currentTimetableItem.endTime + ":00"} bg="white" name="endTime" onChange={(event) => handleInputChange(event)} >
              {hours.map((hour, index) => {
                return <option value={hour}>{hour}:00</option>
              })}
            </Select>
          </FormControl>

          <Button
            colorScheme='#ECF4F4'
            w="100%"
            variant='outline'
            border='1px'
            borderColor='#B4C7C9'
            _hover={{ bg: '#B4C7C9' }}
            onClick={deleteItem}>Delete</Button>

        </Stack>
      </Box>
    </>
  )
}

export default EditTimetableItem;