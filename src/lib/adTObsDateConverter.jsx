import React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { AD_BS_DATA } from './adBSdata';

const engToNep = (adDate) => {
    if (!adDate) return null;

    const adTime = new Date(adDate.getFullYear(), adDate.getMonth(), adDate.getDate(), 0, 0, 0, 0).getTime();

    const currentYearData = AD_BS_DATA.slice().reverse().find(data => {
        const stDateTime = new Date(data.st_date.getFullYear(), data.st_date.getMonth(), data.st_date.getDate(), 0, 0, 0, 0).getTime();
        return stDateTime <= adTime;
    });

    if (!currentYearData) {
        return null;
    }

    const stDateTime = new Date(currentYearData.st_date.getFullYear(), currentYearData.st_date.getMonth(), currentYearData.st_date.getDate(), 0, 0, 0, 0).getTime();
    const timeDiff = adTime - stDateTime;
    let daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    console.log('Input date:', adDate);
    console.log('BS Year:', currentYearData.nyear);
    console.log('BS Year start date (normalized):', new Date(stDateTime));
    console.log('Days from BS year start:', daysDiff);

    let monthIndex = 0;

    for (let i = 0; i < 12; i++) {
        const daysInCurrentBSMonth = currentYearData.days[i];
        console.log(`Month ${i}: has ${daysInCurrentBSMonth} days, remaining days: ${daysDiff}`);
        if (daysDiff < daysInCurrentBSMonth) {
            monthIndex = i;
            break;
        }
        daysDiff -= daysInCurrentBSMonth;
    }

    console.log('Final month index:', monthIndex);
    console.log('Final day:', daysDiff + 1);

    return {
        year: currentYearData.nyear,
        month: monthIndex,
        day: daysDiff + 1,
        daysInMonth: currentYearData.days[monthIndex],
    };
};

const nepToEng = (bsDate) => {
    if (!bsDate || !bsDate.year || bsDate.month === undefined || !bsDate.day) {
        return null;
    }

    const { year: nepYear, month: nepMonth, day: nepDay } = bsDate;

    const yearData = AD_BS_DATA.find(data => data.nyear === nepYear);

    if (!yearData) {
        return null; 
    }

    if (nepDay < 1 || nepDay > yearData.days[nepMonth]) {
        return null; 
    }

    let adDate = new Date(yearData.st_date);

    for (let i = 0; i < nepMonth; i++) {
        adDate.setDate(adDate.getDate() + yearData.days[i]);
    }

    adDate.setDate(adDate.getDate() + (nepDay - 1));

    return adDate;
};


function DateConverter() {
    const todayAD = new Date();
    const todayBS = engToNep(todayAD); 

    const [activeType, setActiveType] = useState(null);
    const [selectedEnglishDate, setSelectedEnglishDate] = useState(null);
    const [year, setYear] = useState(2025);
    const [month, setMonth] = useState(todayAD.getMonth());
    const [englishDays, setEnglishDays] = useState([]);
    const [showEngCalendar, setShowEngCalendar] = useState(false);
    const [englishInputDate, setEnglishInputDate] = useState("____-__-__");
    const engCalendarRef = useRef(null);
    const dropdownRef = useRef(null);
    const engMonthDropDownRef = useRef(null);
    const engInputRef = useRef(null);
    const [selectedNepaliDate, setSelectedNepaliDate] = useState(null);
    const [nepaliYear, setNepaliYear] = useState(todayBS ? todayBS.year : 2082); 
    
    const [nepaliMonth, setNepaliMonth] = useState(todayBS ? todayBS.month : 0); 
    const [nepaliDays, setNepaliDays] = useState([]);
    const [showNepCalendar, setShowNepCalendar] = useState(false);
    const nepCalendarRef = useRef(null);
    const [showNepMonth, setShowNepMonth] = useState(false);
    const nepMonthRef = useRef(null);
    const [showNepYear, setShowNepYear] = useState(false);
    const nepYearRef = useRef(null);
    const [nepaliInputDate, setNepaliInputDate] = useState("____-__-__");
    const nepInputRef = useRef(null);
    const [showEngMonthDropdown, setShowEngMonthDropdown] = useState(false);
    const monthNames = [
        "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
        "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
    ];

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const nepaliMonthNames = [
        "बैशाख", "जेठ", "असार", "श्रावण", "भाद्र", "आश्विन",
        "कार्तिक", "मंसिर", "पौष", "माघ", "फाल्गुन", "चैत्र"
    ];

    const nepaliDayNames = ["आइत", "सोम", "मंगल", "बुध", "बिही", "शुक्र", "शनि"];

   


    const [showEngDropdown, setShowEngDropdown] = useState(false);
    const engYears = [];

    const ongoingYear = new Date().getFullYear();
    const engYearUpperLimit = ongoingYear + 10;
    for (let i = 1933; i <= engYearUpperLimit; i++) {
        engYears.push(i);
    }

    const todayNepdate = engToNep(new Date());
    const onGoingNepYear = todayNepdate.year;

    const nepYearUpperLimit = onGoingNepYear + 10;
    const nepYears = [];
    for (let i = 1990; i <= nepYearUpperLimit; i++) {
        nepYears.push(i);
    }

    const generateEnglishCalendar = useCallback((y, m) => {
        const firstDay = new Date(y, m, 1).getDay();
        const totalDays = new Date(y, m + 1, 0).getDate();
        const newDays = [];

        for (let i = 0; i < firstDay; i++) newDays.push(null);
        for (let i = 1; i <= totalDays; i++) newDays.push(i);

        setEnglishDays(newDays);
    }, []);

    const generateNepaliCalendar = useCallback((ny, nm) => {
        const yearData = AD_BS_DATA.find(data => data.nyear === ny);
        if (!yearData) {
            setNepaliDays([]);
            return;
        }

        let monthStartAD = new Date(yearData.st_date);
        for (let i = 0; i < nm; i++) {
            monthStartAD.setDate(monthStartAD.getDate() + yearData.days[i]);
        }

        const firstDay = monthStartAD.getDay();
       
        const totalDays = yearData.days[nm];
        const newDays = [];

        for (let i = 0; i < firstDay; i++) newDays.push(null);
        for (let i = 1; i <= totalDays; i++) newDays.push(i);

        setNepaliDays(newDays);
    }, []);

    useEffect(() => {
        if (showEngCalendar) generateEnglishCalendar(year, month);
    }, [year, month, showEngCalendar, generateEnglishCalendar]);

    useEffect(() => {
        if (showNepCalendar) generateNepaliCalendar(nepaliYear, nepaliMonth);
    }, [nepaliYear, nepaliMonth, showNepCalendar, generateNepaliCalendar]);


    const isToday = (day) =>
        day &&
        todayAD.getDate() === day &&
        todayAD.getMonth() === month &&
        todayAD.getFullYear() === year;

    
const isTodayNepali = (day) => {
    const todayBS = engToNep(new Date());
    return todayBS &&
        todayBS.day === day &&
        todayBS.month === nepaliMonth &&
        todayBS.year === nepaliYear;
};

    const prevMonth = () => {
        if (activeType === "english") {
            if (year === 1933 && month === 0) {
                setMonth(0);
                setYear(1933);
                return;
            }
            if (month === 0) {
                setMonth(11);
                setYear(year - 1);
            } else setMonth(month - 1);
        } else if (activeType === "nepali") {
            if (nepaliYear === 1990 && nepaliMonth === 0) {
                setNepaliMonth(0);
                setNepaliYear(1990);
                return;
            }
            if (nepaliMonth === 0) {
                const prevYearData = AD_BS_DATA.find(data => data.nyear === nepaliYear - 1);
                if (prevYearData) {
                    setNepaliMonth(11);
                    setNepaliYear(nepaliYear - 1);
                }
            } else setNepaliMonth(nepaliMonth - 1);
        }
    };

    const nextMonth = () => {
        if (activeType === "english") {
            if (year === engYearUpperLimit && month === 11) {
                setMonth(11);
                setYear(engYearUpperLimit);
                return;
            }
            if (month === 11) {
                setMonth(0);
                setYear(year + 1);
            } else setMonth(month + 1);
        } else if (activeType === "nepali") {
            if (nepaliYear === nepYearUpperLimit && nepaliMonth === 11) {
                setNepaliMonth(11);
                setNepaliYear(nepYearUpperLimit);
                return;
            }
            if (nepaliMonth === 11) {
                const nextYearData = AD_BS_DATA.find(data => data.nyear === nepaliYear + 1);
                if (nextYearData) {
                    setNepaliMonth(0);
                    setNepaliYear(nepaliYear + 1);
                }
            } else setNepaliMonth(nepaliMonth + 1);
        }
    };


    const enghandleSelect = (day) => {
        if (!day) return;

        if (activeType === "english") {
            const selectedDate = new Date(year, month, day);
            setSelectedEnglishDate(selectedDate);
            
            const nepDate = engToNep(selectedDate);
            if (nepDate) {
                setSelectedNepaliDate({ year: nepDate.year, month: nepDate.month, day: nepDate.day });
            }
            setShowEngCalendar(false);
            setActiveType(null);
            setShowEngDropdown(false);
            setShowEngMonthDropdown(false);
        }

    };
    const nephandleSelect = (day) => {
        if (!day) return;

        
        const bsDate = {
            year: nepaliYear,   
            month: nepaliMonth, 
            day: day
        };

        setSelectedNepaliDate(bsDate);

        
        const engDate = nepToEng(bsDate);
        if (engDate) {
            setSelectedEnglishDate(engDate); 
        }

        setShowNepCalendar(false);
        setActiveType(null);
        setShowNepMonth(false);
        setShowNepYear(false);
    }

   

     const openEnglishCalendar = (type) => {
        if (showEngCalendar && activeType === type) {
            setShowEngCalendar(false);
            setActiveType(null);
        } else {
           
            if (selectedEnglishDate) {
                setYear(selectedEnglishDate.getFullYear());
                setMonth(selectedEnglishDate.getMonth());
            }
            setActiveType(type);
            setShowEngCalendar(true);
            setShowNepCalendar(false); 
        }
    };
 const openNepaliCalendar = (type) => {
        if (showNepCalendar && activeType === type) {
            setShowNepCalendar(false);
            setActiveType(null);
        } else {
           
            if (selectedNepaliDate) {
                setNepaliYear(selectedNepaliDate.year);
                setNepaliMonth(selectedNepaliDate.month);
            }
            setActiveType(type);
            setShowNepCalendar(true);
            setShowEngCalendar(false); 
        }
    };
    
    useEffect(() => {
        const handleClickOutside = (event) => {
            const isOutsideEng =
                engCalendarRef.current &&
                !engCalendarRef.current.contains(event.target);
            const isOutsideNep =
                nepCalendarRef.current &&
                !nepCalendarRef.current.contains(event.target);

            if (isOutsideEng) {
                if (!showEngDropdown && !showEngMonthDropdown) {
                    setShowEngCalendar(false);
                }

            }

            if (isOutsideNep) {
                if (!showNepMonth || !showNepYear) {
                    setShowNepCalendar(false);
                }

            }


        };


        if (showEngCalendar || showNepCalendar || showEngDropdown || showEngMonthDropdown) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showEngCalendar, showNepCalendar, showEngDropdown, showEngMonthDropdown]);





    const formatBSDate = (date) => {
        if (!date) return "";
        return `${date.year}-${date.month + 1}-${date.day}`;
    };
    const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    
    const [isEngFocused, setIsEngFocused] = useState(false);
    const [isNepFocused, setIsNepFocused] = useState(false);


    /**
     
     * @param {string} value 
     * @returns {string} 
     */



    useEffect(() => {
        if (selectedEnglishDate instanceof Date && !isNaN(selectedEnglishDate)) {
            const y = selectedEnglishDate.getFullYear();
            const m = String(selectedEnglishDate.getMonth() + 1).padStart(2, '0');
            const d = String(selectedEnglishDate.getDate()).padStart(2, '0');
            const formattedDate = `${y}-${m}-${d}`;
            setEnglishInputDate(formattedDate);
        } else if (!isEngFocused) {
            setEnglishInputDate("");
        }
    }, [selectedEnglishDate, isEngFocused]);

useEffect(() => {
    if (selectedNepaliDate &&
        typeof selectedNepaliDate.year === 'number' &&
        typeof selectedNepaliDate.month === 'number' &&
        typeof selectedNepaliDate.day === 'number'
    ) {
        if (!isNepFocused) {
            const y = selectedNepaliDate.year;
            const m = String(selectedNepaliDate.month + 1).padStart(2, '0');
            const d = String(selectedNepaliDate.day).padStart(2, '0');
            const formattedDate = `${y}-${m}-${d}`;
            setNepaliInputDate(formattedDate);
        }
    } else if (!isNepFocused) {
        setNepaliInputDate("");
    }
}, [selectedNepaliDate, isNepFocused]);

    const handleInputFormat = (value) => {
        const digits = value.replace(/\D/g, '');

        let result = '';
        const positions = [4, 7]; 

        for (let i = 0; i < 10; i++) {
            if (positions.includes(i)) {
                result += '-';
            } else {
                const digitIndex = i - positions.filter(p => p < i).length;
                result += digitIndex < digits.length ? digits[digitIndex] : '_';
            }
        }

        return result;
    };


    const handleEnglishInputChange = (event) => {
        const input = event.target;
        const cursorPosition = input.selectionStart;
        const oldValue = englishInputDate;
        let newValue = event.target.value;

        let value = handleInputFormat(newValue);
        setEnglishInputDate(value);

        const numericOnly = value.replace(/\D/g, '');
        const oldNumericOnly = oldValue.replace(/\D/g, '');

        const isDeleting = numericOnly.length < oldNumericOnly.length;

        setTimeout(() => {
            let newCursor = cursorPosition;

            if (isDeleting) {
                while (newCursor > 0 && value[newCursor] === '-') {
                    newCursor--;
                }
            } else {
                
                if (value[newCursor] === '-') {
                    newCursor++;
                }
                else if (newCursor > 0 && value[newCursor] === '-' && value[newCursor - 1] !== '_') {
                    newCursor++;
                }
            }

            input.setSelectionRange(newCursor, newCursor);
        }, 0);

        if (numericOnly.length < 8) {
            setSelectedEnglishDate(null);
            setSelectedNepaliDate(null);
            return;
        }

        if (numericOnly.length === 8) {
            const y = parseInt(numericOnly.substring(0, 4));
            const m = parseInt(numericOnly.substring(4, 6));
            const d = parseInt(numericOnly.substring(6, 8));

            const inputDate = new Date(y, m - 1, d);
            const isValidDate = inputDate.getFullYear() === y &&
                inputDate.getMonth() === (m - 1) &&
                inputDate.getDate() === d;
            const isValidBounds = m >= 1 && m <= 12 && d >= 1 && d <= 31;

            if (isValidDate && isValidBounds) {
                setSelectedEnglishDate(inputDate);
                setYear(y);
                setMonth(m - 1);

                const nepDate = engToNep(inputDate);
                console.log('About to convert:', inputDate); 

                if (nepDate) {
                    setSelectedNepaliDate({ year: nepDate.year, month: nepDate.month, day: nepDate.day });
                    setNepaliYear(nepDate.year);
                    setNepaliMonth(nepDate.month);
                } else {
                    setSelectedNepaliDate(null);
                }
                return;
            }
        }

        setSelectedEnglishDate(null);
        setSelectedNepaliDate(null);
    };

    const handleEnglishKeyDown = (event) => {
        const input = event.target;
        const selectionStart = input.selectionStart;
        const selectionEnd = input.selectionEnd;

        if (selectionStart !== selectionEnd && (event.key === 'Backspace' || event.key === 'Delete')) {
            event.preventDefault();

            const value = englishInputDate;
            const resultArray = value.split('');

            for (let i = selectionStart; i < selectionEnd; i++) {
                if (resultArray[i] !== '-') {
                    resultArray[i] = '_';
                }
            }

            const newValue = resultArray.join('');
            setEnglishInputDate(newValue);

            setTimeout(() => {
                input.setSelectionRange(selectionStart, selectionStart);
            }, 0);

            setSelectedEnglishDate(null);
            setSelectedNepaliDate(null);

            return;
        }

        if (event.key === 'Backspace') {
            const cursorPosition = input.selectionStart;
            const value = englishInputDate;

            if (cursorPosition > 0 && value[cursorPosition - 1] === '-') {
                event.preventDefault();

                let digitPos = cursorPosition - 2;
                while (digitPos >= 0 && (value[digitPos] === '-' || value[digitPos] === '_')) {
                    digitPos--;
                }

                if (digitPos >= 0) {
                    const numericOnly = value.replace(/\D/g, '');

                    let digitsBeforeCursor = 0;
                    for (let i = 0; i < cursorPosition - 1; i++) {
                        if (value[i] !== '-' && value[i] !== '_') {
                            digitsBeforeCursor++;
                        }
                    }

                    const newNumeric = numericOnly.slice(0, digitsBeforeCursor - 1) + numericOnly.slice(digitsBeforeCursor);
                    const newFormatted = handleInputFormat(newNumeric);
                    setEnglishInputDate(newFormatted);

                    setTimeout(() => {
                        input.setSelectionRange(cursorPosition - 2, cursorPosition - 2);
                    }, 0);
                }
            }
        }
    };

 const handleNepaliKeyDown = (event) => {
    const input = event.target;
    const selectionStart = input.selectionStart;
    const selectionEnd = input.selectionEnd;

    if (selectionStart !== selectionEnd && (event.key === 'Backspace' || event.key === 'Delete')) {
        event.preventDefault();
        const value = nepaliInputDate;
        const resultArray = value.split('');

        for (let i = selectionStart; i < selectionEnd; i++) {
            if (resultArray[i] !== '-') {
                resultArray[i] = '_';
            }
        }

        const newValue = resultArray.join('');
        setNepaliInputDate(newValue);

        setTimeout(() => {
            input.setSelectionRange(selectionStart, selectionStart);
        }, 0);

        setSelectedEnglishDate(null);
        setSelectedNepaliDate(null);
        return;
    }

    if (event.key === 'Backspace') {
        const cursorPosition = input.selectionStart;
        const value = nepaliInputDate;

        if (cursorPosition > 0 && value[cursorPosition - 1] === '-') {
            event.preventDefault();

            let digitPos = cursorPosition - 2;
            while (digitPos >= 0 && (value[digitPos] === '-' || value[digitPos] === '_')) {
                digitPos--;
            }

            if (digitPos >= 0) {
                const numericOnly = value.replace(/\D/g, '');

                let digitsBeforeCursor = 0;
                for (let i = 0; i < cursorPosition - 1; i++) {
                    if (value[i] !== '-' && value[i] !== '_') {
                        digitsBeforeCursor++;
                    }
                }

                const newNumeric = numericOnly.slice(0, digitsBeforeCursor - 1) + numericOnly.slice(digitsBeforeCursor);
                const newFormatted = handleInputFormat(newNumeric);
                setNepaliInputDate(newFormatted);

                setTimeout(() => {
                    input.setSelectionRange(cursorPosition - 2, cursorPosition - 2);
                }, 0);
                
                setSelectedEnglishDate(null);
                setSelectedNepaliDate(null);
            }
        }
    }
};

const handleNepaliInputChange = (event) => {
    const input = event.target;
    const cursorPosition = input.selectionStart;
    const oldValue = nepaliInputDate;
    let newValue = event.target.value;

    let value = handleInputFormat(newValue);
    setNepaliInputDate(value);

    const numericOnly = value.replace(/\D/g, '');
    const oldNumericOnly = oldValue.replace(/\D/g, '');

    const isDeleting = numericOnly.length < oldNumericOnly.length;

    setTimeout(() => {
        let newCursor = cursorPosition;

        if (isDeleting) {
            while (newCursor > 0 && value[newCursor] === '-') {
                newCursor--;
            }
        } else {
            
            if (value[newCursor] === '-') {
                newCursor++;
            }
            else if (newCursor > 0 && value[newCursor] === '-' && value[newCursor - 1] !== '_') {
                newCursor++;
            }
        }

        input.setSelectionRange(newCursor, newCursor);
    }, 0);

    if (numericOnly.length === 0) {
        setSelectedEnglishDate(null);
        setSelectedNepaliDate(null);
        return;
    }

    if (numericOnly.length < 8) {
        return;
    }

    if (numericOnly.length === 8) {
        const y = parseInt(numericOnly.substring(0, 4));
        const m = parseInt(numericOnly.substring(4, 6));
        const d = parseInt(numericOnly.substring(6, 8));

        const nepaliMonthIndex = m - 1;

        const yearData = AD_BS_DATA.find(data => data.nyear === y);

        let isValidBSDate = false;
        if (yearData && nepaliMonthIndex >= 0 && nepaliMonthIndex <= 11) {
            const daysInMonth = yearData.days[nepaliMonthIndex];
            if (d >= 1 && d <= daysInMonth) {
                isValidBSDate = true;
            }
        }

        if (isValidBSDate) {
            const bsDateObject = { year: y, month: nepaliMonthIndex, day: d };
            setSelectedNepaliDate(bsDateObject);
            setNepaliYear(y);
            setNepaliMonth(nepaliMonthIndex);

            const engDate = nepToEng(bsDateObject);
            if (engDate) {
                setSelectedEnglishDate(engDate);
                setYear(engDate.getFullYear());
                setMonth(engDate.getMonth());
            } else {
                setSelectedEnglishDate(null);
            }
            return;
        }
    }

    setSelectedEnglishDate(null);
    setSelectedNepaliDate(null);
};

return (
    <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center"
        }}>
            <div style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",       /* gap-2 (8px) */
                width: "100%",
                padding: "0.5rem",    /* p-2 (8px) */
                justifyContent: "center",
                alignItems: "center"
            }}>
                <div style={{

                    display: "flex",
                    flexDirection: "row",
                    flexWrap: 'wrap',  /* flex-col (mobile/default view) */
                    gap: "0.75rem",           /* gap-3 (12px) */
                    width: "100%",            /* w-full */
                    justifyContent: "center",
                    alignItems: "center"

                }}>
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        width: "14rem",
                        backgroundColor: "transparent"
                    }}>                        <span style={{
                        fontWeight: "700",
                        paddingLeft: "0.75rem",
                        paddingRight: "0.75rem",
                        backgroundColor:'transparent'
                    }}>
                            Date in AD
                        </span>

                        <div style={{
                            display: "flex"
                        }}>
                            <button style={{
                                display: "flex",
                                flexDirection: "column",
                                width: "100%",
                                height: "3rem",
                                border: "none",
                                borderTopLeftRadius: "4px",
                                borderBottomLeftRadius: "4px",
                                position: "relative",
                                textAlign: "center"
                            }}>

                                <input
                                    ref={engInputRef}
                                    id="english-date-input"
                                    type="text"
                                    value={isEngFocused ? englishInputDate : (selectedEnglishDate ? englishInputDate : "")}
                                    onChange={handleEnglishInputChange}
                                    onKeyDown={handleEnglishKeyDown}
                                    onFocus={() => {
                                        setIsEngFocused(true);
                                        if (!englishInputDate || englishInputDate === "") {
                                            setEnglishInputDate("____-__-__");
                                        }
                                    }}
                                    onBlur={() => {
                                        setIsEngFocused(false);
                                        if (!selectedEnglishDate) {
                                            setEnglishInputDate("");
                                        }
                                    }}
                                    placeholder="YYYY-MM-DD"
                                    style={{
                                        marginTop: "1rem",
                                        fontSize: "0.875rem",
                                        width: "70%",
                                        background: "transparent",
                                        outline: "none",
                                        marginLeft: "auto",
                                        marginRight: "auto",
                                        textAlign: "center",
                                        border: "none",
                                    }}
                                />
                            </button>
                            <button
                                onClick={() => openEnglishCalendar("english")}
                                style={{
                                    height: "3rem",
                                    paddingLeft: "8px",
                                    paddingRight: "8px",
                                    backgroundColor: "#2294f2",
                                    color: "white",
                                    fontWeight: 600,
                                    borderTopRightRadius: "4px",
                                    borderBottomRightRadius: "4px",
                                    border: "none",
                                    display: "flex",
                                    alignItems: "center",
                                }}
                            >
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>

                            </button>
                        </div>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            width: "14rem",
                            flexDirection: "column",
                            backgroundColor: "transparent",
                        }}
                    >
                        <span
                            style={{
                                fontWeight: "bold",
                                paddingLeft: "12px",
                                paddingRight: "12px",
                                backgroundColor:'transparent'
                            }}
                        >
                            Date in BS
                        </span>

                        <div style={{ display: "flex" }}>
                            <button
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    width: "100%",
                                    height: "3rem",
                                    border: "none",
                                    borderTopLeftRadius: "4px",
                                    borderBottomLeftRadius: "4px",
                                    position: "relative",
                                    textAlign: "center",
                                }}
                            >
                                <input
                                    ref={nepInputRef}
                                    id="nepali-date-input"
                                    type="text"
                                    value={
                                        isNepFocused ? nepaliInputDate : selectedNepaliDate ? nepaliInputDate : ""
                                    }
                                    onChange={handleNepaliInputChange}
                                    onKeyDown={handleNepaliKeyDown}
                                    onFocus={() => {
                                        setIsNepFocused(true);
                                        if (!nepaliInputDate || nepaliInputDate === "") {
                                            setNepaliInputDate("____-__-__");
                                        }
                                    }}
                                    onBlur={() => {
                                        setIsNepFocused(false);
                                        if (!selectedNepaliDate) {
                                            setNepaliInputDate("");
                                        }
                                    }}
                                    placeholder="YYYY-MM-DD"
                                    style={{
                                        marginTop: "1rem",
                                        fontSize: "0.875rem",
                                        width: "70%",
                                        background: "transparent",
                                        outline: "none",
                                        marginLeft: "auto",
                                        marginRight: "auto",
                                        textAlign: "center",
                                        border: "none",
                                    }}
                                />
                            </button>

                            <button
                                onClick={() => openNepaliCalendar("nepali")}
                                style={{
                                    height: "3rem",
                                    paddingLeft: "8px",
                                    paddingRight: "8px",
                                    backgroundColor: "#2294f2",
                                    color: "white",
                                    fontWeight: 600,
                                    borderTopRightRadius: "4px",
                                    borderBottomRightRadius: "4px",
                                    border: "none",
                                    display: "flex",
                                    alignItems: "center",
                                }}
                            >
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                            </button>
                        </div>
                    </div>

                </div>

                {showEngCalendar && (
                    <div
                        ref={engCalendarRef}
                         style={{
                            position: "absolute",
                            bottom: '50%',
                            right: '50%',
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.5rem",
                            padding: "0.5rem",
                        }}
                    >
                        <div
                            style={{
                                width: "220px",
                                marginLeft: "auto",
                                marginRight: "auto",
                                padding: "0.5rem",
                                fontFamily: "Lato, sans-serif",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    backgroundColor: "#2294f2",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    color: "white",
                                    paddingTop: "0.5rem",
                                    paddingBottom: "0.5rem",
                                    paddingLeft: "0.5rem",
                                    paddingRight: "0.5rem",
                                    borderTopLeftRadius: "10px",
                                    borderTopRightRadius: "10px",
                                }}
                            >
                                <i
                                    style={{
                                        cursor: "pointer",
                                        userSelect: "none",
                                        fontSize: "0.875rem",
                                    }}
                                    onClick={() => {
                                        if (year >= 1933) {
                                            prevMonth();
                                        } else {
                                            setYear(1933);
                                        }
                                    }}
                                >
                                    &lt;
                                </i>

                                <button
                                    style={{
                                        fontSize: "0.875rem",
                                        fontWeight: 600,
                                        background: "transparent",
                                        border: "none",
                                        color: "inherit",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => {
                                        setShowEngMonthDropdown(!showEngMonthDropdown);
                                        setShowEngDropdown(false);
                                    }}
                                >
                                    {monthNames[month]}
                                </button>

                                <button
                                    style={{
                                        fontSize: "0.875rem",
                                        fontWeight: 600,
                                        background: "transparent",
                                        border: "none",
                                        color: "inherit",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => {
                                        setShowEngDropdown(!showEngDropdown);
                                        setShowEngMonthDropdown(false);
                                    }}
                                >
                                    {year}
                                </button>

                                <i
                                    style={{
                                        cursor: "pointer",
                                        userSelect: "none",
                                        fontSize: "0.875rem",
                                    }}
                                    onClick={nextMonth}
                                >
                                    &gt;
                                </i>
                            </div>

                            {showEngDropdown && (
                                <div
                                    ref={dropdownRef}
                                    style={{
                                        position: "absolute",
                                        height: "11.3rem",
                                        width: "5rem",
                                        overflowY: "auto",
                                        backgroundColor: "white",
                                        border: "1px solid #ccc",
                                        borderRadius: "4px",
                                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                        zIndex: 10,
                                        marginLeft: "6.5rem",
                                    }}
                                >
                                    {engYears.map((yr) => (
                                        <div
                                            key={yr}
                                            onClick={() => {
                                                setYear(yr);
                                                setTimeout(() => setShowEngDropdown(false), 100);
                                            }}
                                            style={{
                                                paddingLeft: "0.75rem",
                                                paddingRight: "0.75rem",
                                                paddingTop: "0.25rem",
                                                paddingBottom: "0.25rem",
                                                cursor: "pointer",
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = "#e5e7eb"; // Tailwind gray-200
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = "transparent";
                                            }}
                                        >
                                            {yr}
                                        </div>
                                    ))}
                                </div>

                            )}
                            {showEngMonthDropdown && (
                                <div
                                    ref={engMonthDropDownRef}
                                    style={{
                                        position: "absolute",
                                        height: "11rem",
                                        marginTop: "0.2rem",
                                        marginLeft: "0.3rem",
                                        width: "8rem",
                                        overflowY: "auto",
                                        backgroundColor: "white",
                                        border: "1px solid #ccc",
                                        borderRadius: "4px",
                                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                        zIndex: 10,
                                    }}
                                >
                                    {monthNames.map((mnth, index) => (
                                        <div
                                            key={index}
                                            onClick={() => {
                                                setMonth(index);
                                                setTimeout(() => setShowEngMonthDropdown(false), 100);
                                            }}
                                            style={{
                                                paddingLeft: "0.75rem",
                                                paddingRight: "0.75rem",
                                                paddingTop: "0.25rem",
                                                paddingBottom: "0.25rem",
                                                cursor: "pointer",
                                            }}
                                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e5e7eb")}
                                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                                        >
                                            {mnth}
                                        </div>
                                    ))}
                                </div>

                            )}
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    backgroundColor: "white",
                                    padding: "0.25rem",
                                    border: "1px solid #ccc",
                                    borderBottom: "none",
                                }}
                            >
                                {dayNames.map((d) => (
                                    <div
                                        key={d}
                                        style={{
                                            flex: 1,
                                            textAlign: "center",
                                            color: "#4b5563", // Tailwind gray-600
                                            fontSize: "10px",
                                            fontWeight: 600,
                                        }}
                                    >
                                        {d}
                                    </div>
                                ))}
                            </div>


                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(7, 1fr)",
                                    border: "1px solid #ccc",
                                    backgroundColor: "white",
                                    borderBottomLeftRadius: "10px",
                                    borderBottomRightRadius: "10px",
                                    overflow: "hidden",
                                    height: "160px",
                                    gridAutoRows: "1fr",
                                }}
                            >
                                {englishDays.map((day, index) => {
                                    const isSelected =
                                        selectedEnglishDate &&
                                        selectedEnglishDate.getDate() === day &&
                                        selectedEnglishDate.getMonth() === month &&
                                        selectedEnglishDate.getFullYear() === year;

                                    // Base cell styles
                                    const cellStyle = {
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        textAlign: "center",
                                        backgroundColor: day ? "transparent" : "#e5e7eb", // gray-200
                                        cursor: day ? "pointer" : "default",
                                    };

                                    // Base number styles
                                    const spanStyle = {
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "11px",
                                    };

                                    // Selected Day Style
                                    if (isSelected) {
                                        Object.assign(spanStyle, {
                                            backgroundColor: "#2294f2",
                                            color: "white",
                                            fontWeight: 600,
                                            width: "1.5rem",
                                            height: "1.5rem",
                                            borderRadius: "9999px",
                                        });
                                    }
                                    // Today Style
                                    else if (isToday(day)) {
                                        Object.assign(spanStyle, {
                                            color: "#1f2937", // gray-800
                                            fontWeight: 900,
                                        });
                                    }
                                    // Normal Dates
                                    else {
                                        Object.assign(spanStyle, {
                                            color: "#4b5563", // gray-600
                                        });
                                    }

                                    return (
                                        <div
                                            key={index}
                                            style={cellStyle}
                                            onClick={() => enghandleSelect(day)}
                                            onMouseEnter={(e) => {
                                                if (day) e.currentTarget.style.backgroundColor = "#f5f5f5"; // hover gray-100
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = day ? "transparent" : "#e5e7eb";
                                            }}
                                        >
                                            <span style={spanStyle}>
                                                {day || ""}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                        </div>
                    </div>

                )}













                {showNepCalendar && (
                    <div
                        ref={nepCalendarRef}
                        style={{
                            position: "absolute",
                            bottom: '50%',
                            left: '50%',
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.5rem",
                            padding: "0.5rem",
                        }}
                    >
                        <div
                            style={{
                                width: "220px",
                                marginLeft: "auto",
                                marginRight: "auto",
                                padding: "0.5rem",
                                fontFamily: "Lato, sans-serif",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    backgroundColor: "#2294f2",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    color: "white",
                                    paddingTop: "0.5rem",
                                    paddingBottom: "0.5rem",
                                    paddingLeft: "0.5rem",
                                    paddingRight: "0.5rem",
                                    borderTopLeftRadius: "10px",
                                    borderTopRightRadius: "10px",
                                }}
                            >
                                <i
                                    style={{
                                        cursor: "pointer",
                                        userSelect: "none",
                                        fontSize: "0.875rem",
                                    }}
                                    onClick={prevMonth}
                                >
                                    &lt;
                                </i>

                                <button
                                    style={{
                                        fontSize: "0.875rem",
                                        fontWeight: 600,
                                        background: "transparent",
                                        border: "none",
                                        color: "inherit",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => {
                                        setShowNepMonth(!showNepMonth);
                                        setShowNepYear(false);
                                    }}
                                >
                                    {nepaliMonthNames[nepaliMonth]}
                                </button>

                                <button
                                    style={{
                                        fontSize: "0.875rem",
                                        fontWeight: 600,
                                        background: "transparent",
                                        border: "none",
                                        color: "inherit",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => {
                                        setShowNepYear(!showNepYear);
                                        setShowNepMonth(false);
                                    }}
                                >
                                    {nepaliYear}
                                </button>

                                <i
                                    style={{
                                        cursor: "pointer",
                                        userSelect: "none",
                                        fontSize: "0.875rem",
                                    }}
                                    onClick={nextMonth}
                                >
                                    &gt;
                                </i>
                            </div>

                            {showNepYear && (
                                <div
                                    ref={nepYearRef}
                                    style={{
                                        position: "absolute",
                                        height: "11.3rem",
                                        width: "5rem",
                                        overflowY: "auto",
                                        backgroundColor: "white",
                                        border: "1px solid #ccc",
                                        borderRadius: "4px",
                                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                        zIndex: 10,
                                        marginLeft: "6.5rem",
                                    }}
                                >
                                    {nepYears.map((yr) => (
                                        <div
                                            key={yr}
                                            onClick={() => {
                                                setNepaliYear(yr);
                                                setTimeout(() => {
                                                    setShowNepYear(false);
                                                }, 100);
                                            }}
                                            style={{
                                                paddingLeft: "0.75rem",
                                                paddingRight: "0.75rem",
                                                paddingTop: "0.25rem",
                                                paddingBottom: "0.25rem",
                                                cursor: "pointer",
                                            }}
                                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e5e7eb")}
                                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                                        >
                                            {yr}
                                        </div>
                                    ))}
                                </div>

                            )}

                            {showNepMonth && (
                                <div
                                    ref={nepMonthRef}
                                    style={{
                                        position: "absolute",
                                        height: "11rem",
                                        marginTop: "0.2rem",
                                        marginLeft: "0.3rem",
                                        width: "8rem",
                                        overflowY: "auto",
                                        backgroundColor: "white",
                                        border: "1px solid #ccc",
                                        borderRadius: "4px",
                                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                        zIndex: 10,
                                    }}
                                >
                                    {nepaliMonthNames.map((mnth, index) => (
                                        <div
                                            key={index}
                                            onClick={() => {
                                                setNepaliMonth(index);
                                                setTimeout(() => {
                                                    setShowNepMonth(false);
                                                }, 100);
                                            }}
                                            style={{
                                                paddingLeft: "0.75rem",
                                                paddingRight: "0.75rem",
                                                paddingTop: "0.25rem",
                                                paddingBottom: "0.25rem",
                                                cursor: "pointer",
                                            }}
                                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e5e7eb")}
                                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                                        >
                                            {mnth}
                                        </div>
                                    ))}
                                </div>

                            )}
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    backgroundColor: "white",
                                    padding: "0.25rem",
                                    border: "1px solid #ccc",
                                    borderBottom: "none",
                                }}
                            >
                                {nepaliDayNames.map((d) => (
                                    <div
                                        key={d}
                                        style={{
                                            flex: 1,
                                            textAlign: "center",
                                            color: "#4b5563", // gray-600
                                            fontSize: "10px",
                                            fontWeight: 600,
                                        }}
                                    >
                                        {d}
                                    </div>
                                ))}
                            </div>


                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(7, 1fr)",
                                    border: "1px solid #ccc",
                                    backgroundColor: "white",
                                    borderBottomLeftRadius: "10px",
                                    borderBottomRightRadius: "10px",
                                    overflow: "hidden",
                                    height: "160px",
                                    gridAutoRows: "1fr",
                                }}
                            >
                                {nepaliDays.map((day, index) => {
                                    const isSelected =
                                        selectedNepaliDate &&
                                        selectedNepaliDate.day === day &&
                                        selectedNepaliDate.month === nepaliMonth &&
                                        selectedNepaliDate.year === nepaliYear;

                                    // Base cell style
                                    const cellStyle = {
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        textAlign: "center",
                                        backgroundColor: day ? "white" : "#e5e7eb", // gray-200
                                        cursor: day ? "pointer" : "default",
                                    };

                                    // Base day number style
                                    const spanStyle = {
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "11px",
                                    };

                                    if (isSelected) {
                                        Object.assign(spanStyle, {
                                            backgroundColor: "#2294f2",
                                            color: "white",
                                            fontWeight: 600,
                                            width: "1.5rem",
                                            height: "1.5rem",
                                            borderRadius: "9999px",
                                        });
                                    } else if (isTodayNepali(day)) {
                                        Object.assign(spanStyle, {
                                            color: "#1f2937", // gray-800
                                            fontWeight: 900,
                                        });
                                    } else {
                                        Object.assign(spanStyle, {
                                            color: "#4b5563", // gray-600
                                        });
                                    }

                                    return (
                                        <div
                                            key={index}
                                            style={cellStyle}
                                            onClick={() => nephandleSelect(day)}
                                            onMouseEnter={(e) => {
                                                if (day) e.currentTarget.style.backgroundColor = "#f5f5f5"; // hover gray-100
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = day ? "white" : "#e5e7eb";
                                            }}
                                        >
                                            <span style={spanStyle}>{day || ""}</span>
                                        </div>
                                    );
                                })}
                            </div>

                        </div>
                    </div>
                )}






            </div>
        </div>


    );
}

DateConverter.engToNep = engToNep;
DateConverter.nepToEng = nepToEng;
export default DateConverter;