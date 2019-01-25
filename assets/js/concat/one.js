function setPrintFiveDays($this)
{
	var dates = [], datesRange = [], response = [], datesObject = {};
	/** print current date and add 4 days **/
	$('label[for="0"]').text($this.val());
	datesRange.push($this.val());
	datesObject[$this.val()] = 0;
	var getDate     = $this.datepicker('getDate');
	var getDateTime = $this.datepicker('getDate').getTime();
	var nextDay     = new Date(getDate);
	var i           = 1;
	while (i < 5) {
		nextDay.setDate(nextDay.getDate() + 1);
		var dayIndex = nextDay.getDate(), monthIndex = nextDay.getMonth() + 1, yearIndex = nextDay.getFullYear();
		var dateNext = putZero(dayIndex) + '-' + putZero(monthIndex) + '-' + yearIndex;
		$('label[for="' + i + '"]').text(dateNext);
		dates.push(dateNext);
		datesRange.push(dateNext);
		datesObject[dateNext] = 0;
		i++;
	}
	response.dates       = dates;
	response.datesRange  = datesRange;
	response.datesObject = datesObject;
	return response;
}