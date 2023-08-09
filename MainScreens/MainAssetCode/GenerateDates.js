import moment from "moment";
  const GenerateDates = () => {
    const dates = [];
    for (let i = -180; i <= 180; i++) {
      const date = moment().add(i, "days");
      dates.push({
        dateString: date.format("YYYY-MM-DD"),
        day: date.format("ddd").toUpperCase(),
        date: date.format("D"),
      });
    }
    return dates;
  };
  
  export default GenerateDates