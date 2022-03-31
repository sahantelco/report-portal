import { Component, OnInit, ViewChild } from '@angular/core';
import { first, map } from 'rxjs/operators';

import { AccountService, AlertService } from '@app/_services';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { ActivityDetails, ClassDetail, Graphdata } from '../_models/user'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';


@Component({ templateUrl: 'home.component.html', styleUrls: ['home.component.scss'] })
export class HomeComponent {
    users = null;
    form: FormGroup;
    loading = false;
    submitted = false;
    classSelected = '';
    studentSelected = '';
    studentArr: any;
    classes: any;
    activityDataList: any;
    dateSelected: boolean;
    @ViewChild(MatSort) sort: MatSort;
    displayedColumns = ['date', 'content', 'type', 'skill', 'result', 'time'];
    private originalResultSet: ActivityDetails[] = [];
    graphdata: Graphdata[] = [];
    dataSource = new MatTableDataSource<ActivityDetails>();


    range = new FormGroup({
        start: new FormControl(),
        end: new FormControl()
    });

    constructor(private accountService: AccountService, private formBuilder: FormBuilder, private alertService: AlertService) { }

    ngOnInit() {

        this.accountService.getAllClassDetails()
            .subscribe(classes => {
                this.accountService.getAllReport().pipe(
                    map(a => {
                        const reports = JSON.parse(a.body);
                        const activityDetails: ActivityDetails[] = [];
                        reports.forEach(element => {
                            const studentClass = classes.find(x => x.students.some(y => element.student === y))
                            element.class = studentClass.name;
                            element.attempts.weeks.forEach((attempt, index) => {
                                activityDetails.push({
                                    classId: studentClass.id,
                                    className: studentClass.name,
                                    content: element.content,
                                    student: element.student,
                                    time: element.time,
                                    skill: element.skill,
                                    type: element.type,
                                    date: this.formatDate(attempt),
                                    result: element.attempts.values[index]
                                })
                            });
                        });

                        return activityDetails;
                    }))
                    .subscribe(result => {
                        this.originalResultSet = result;
                        this.dataSource = new MatTableDataSource<ActivityDetails>(result);
                        this.dataSource.sort = this.sort;
                        this.intializeGraphData(this.originalResultSet);

                    });
                this.classes = classes;
            });


    }

    intializeGraphData(resultSet: any): void {
        this.graphdata = [];

        if (resultSet.length != 0) {
            const excellentCount = resultSet.filter(function (item) {
                return item.result >= 90;
            }).length;
            const goodCount = resultSet.filter(function (item) {
                return (item.result >= 80 && item.result < 90);
            }).length;
            const okCount = resultSet.filter(function (item) {
                return (item.result >= 60 && item.result < 80);
            }).length;
            const weekCount = resultSet.filter(function (item) {
                return (item.result < 60);
            }).length;

            this.graphdata.push({
                excellent: Math.floor(excellentCount / resultSet.length * 100),
                good: Math.floor(goodCount / resultSet.length * 100),
                ok: Math.floor(okCount / resultSet.length * 100),
                weak: Math.floor(weekCount / resultSet.length * 100),
            })

        }
    }

    ngAfterViewInit() {
        this.dataSource.sort = this.sort;
    }

    onClassChange() {
        if (this.dateSelected) {
            const newResultSet = this.originalResultSet.filter(a => {
                return (a.className === this.classSelected) && (this.range.value.start.getTime() < a.date.getTime() && a.date.getTime() < this.range.value.end.getTime())
            })
            this.dataSource = new MatTableDataSource<ActivityDetails>(newResultSet);
            this.intializeGraphData(newResultSet)
        } else {
            const newResultSet = this.originalResultSet.filter(a => a.className === this.classSelected)
            this.dataSource = new MatTableDataSource<ActivityDetails>(newResultSet);
            this.intializeGraphData(newResultSet)
        }
        this.studentArr = this.classes.filter((x: any) => { return x.name == this.classSelected });
        this.studentArr = this.studentArr[0].students;


    }


    onStudentChange() {
        if (this.dateSelected) {
            const newResultSet = this.originalResultSet.filter(a => {
                return (a.student === this.studentSelected) && (this.range.value.start.getTime() < a.date.getTime() && a.date.getTime() < this.range.value.end.getTime())
            })
            this.dataSource = new MatTableDataSource<ActivityDetails>(newResultSet);
            this.intializeGraphData(newResultSet)
        } else {
            const newResultSet = this.originalResultSet.filter(a => {
                return (a.student === this.studentSelected)
            })
            this.dataSource = new MatTableDataSource<ActivityDetails>(newResultSet);
            this.intializeGraphData(newResultSet)
        }

    }

    onDateRangeValueChange() {
        this.dateSelected = true;
        let startDate = this.range.value.start;
        let endDate = this.range.value.end;

        if (this.range.value.end == null) {
            this.dateSelected = false;
        } else {
            const newResultSet = this.originalResultSet.filter(a => {
                return (startDate.getTime() < a.date.getTime() && a.date.getTime() < endDate.getTime())
            })

            this.dataSource = new MatTableDataSource<ActivityDetails>(newResultSet);

            this.intializeGraphData(newResultSet)
        }



    }

    formatDate(time: any) {
        var split = time.split('/');
        var date = new Date(split[2], split[1], split[0]); //Y M D
        var timestamp = date.getTime();

        return date;
    }

}