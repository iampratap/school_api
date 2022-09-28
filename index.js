const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const cors = require('cors');
app.use(cors());

const mysql = require('mysql');
const {
    query
} = require('express');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_db',
    port: 3306
});

connection.connect(err => {
    if (err) {
        console.log(err);
    } else {
        console.log("Database connected");
    }
})


app.get('/', (req, res) => {
    res.send("Hello world");
});

app.get('/get_all_std', (req, res) => {
    const query = "SELECT * FROM std";
    connection.query(query, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send({
                success: false,
                msg: 'Server error',
                data: []
            })
        } else {
            res.status(200).send({
                success: true,
                msg: 'Success',
                data: result
            });
        }
    })
})

app.get('/get_all_students', (req, res) => {
    const query = "SELECT * FROM students";
    connection.query(query, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send({
                success: false,
                msg: 'Server error',
                data: []
            })
        } else {
            res.status(200).send({
                success: true,
                msg: 'Success',
                data: result
            });
        }
    })
})

app.get('/get_students_by_std/:std_id', (req, res) => {
    const std_id = req.params.std_id;
    const query = "SELECT * FROM students WHERE std_id = ?";
    connection.query(query, [std_id], (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send({
                success: false,
                msg: 'Server error',
                data: []
            })
        } else {
            res.status(200).send({
                success: true,
                msg: 'Success',
                data: result
            });
        }
    })
});

app.get('/get_single_students/:student_id', (req, res) => {
    const student_id = req.params.student_id;
    const query = "SELECT * FROM students WHERE student_id = ?";
    connection.query(query, [student_id], (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send({
                success: false,
                msg: 'Server error',
                data: []
            })
        } else {
            res.status(200).send({
                success: true,
                msg: 'Success',
                data: result
            });
        }
    })
});

app.post('/add_student', (req, res) => {
    const student_name = req.body.student_name;
    const std_id = req.body.std_id;
    const roll_no = req.body.roll_no;
    const gender = req.body.gender;
    check_admission_status(std_id, (status) => {
        if (status) {
            const query = "INSERT INTO students (student_id, student_name, std_id, roll_no, gender) VALUES (NULL, ?, ?, ?, ?)";
            connection.query(query, [student_name, std_id, roll_no, gender], (err, result) => {
                if (err) {
                    console.log(err);
                    res.status(500).send({
                        success: false,
                        msg: 'Server error',
                        data: []
                    })
                } else {
                    get_admission_count(std_id, (count) => {
                        console.log(count);
                        if (count >= 5) {
                            admission_toggle(std_id, 0, (update) => {
                                console.log(update);
                                res.status(200).send({
                                    success: true,
                                    msg: 'Success',
                                    data: result
                                });
                            })
                        } else {
                            admission_toggle(std_id, 1, (update) => {
                                res.status(200).send({
                                    success: true,
                                    msg: 'Success',
                                    data: result
                                });
                            })
                        }
                    })


                }
            })
        } else {
            res.status(500).send({
                success: false,
                msg: 'Admission Closed',
                data: []
            })
        }
    })
});

app.put('/update_student/:student_id', (req, res) => {
    const student_id = req.params.student_id;
    const student_name = req.body.student_name;
    const std_id = req.body.std_id;
    const roll_no = req.body.roll_no;
    const gender = req.body.gender;
    const query = "UPDATE students SET student_name = ?, std_id = ?, roll_no = ?, gender = ? WHERE students.student_id = ?";
    connection.query(query, [student_name, std_id, roll_no, gender, student_id], (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send({
                success: false,
                msg: 'Server error',
                data: []
            })
        } else {
            res.status(200).send({
                success: true,
                msg: 'Success',
                data: result
            });
        }
    })
});

app.delete('/delete_student/:student_id', (req, res) => {
    const student_id = req.params.student_id;
    const query = "DELETE FROM students WHERE students.student_id = ?";
    connection.query(query, [student_id], (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send({
                success: false,
                msg: 'Server error',
                data: []
            })
        } else {
            res.status(200).send({
                success: true,
                msg: 'Success',
                data: result.affectedRows
            });
        }
    })
});

function admission_toggle(std_id, status, callback) {
    const query = "UPDATE `std` SET `admission` =  ? WHERE `std`.`std_id` = ?";
    connection.query(query, [status, std_id], (err, result) => {
        if (err) {
            callback(false);
        } else {
            callback(true);
        }
    });
}

function check_admission_status(std_id, callback) {
    const query = "SELECT std.admission FROM std WHERE std_id = ?";
    connection.query(query, [std_id], (err, result) => {
        if (err || result.length == 0 || result[0].admission == 0) {
            callback(false);
        } else {
            callback(true);
        }
    });
}

function get_admission_count(std_id, callback) {
    const query = "SELECT COUNT(student_id) as count FROM students WHERE std_id = ?";
    connection.query(query, std_id, (err, result) => {
        callback(result[0].count);
    })
}

app.listen(4050, err => {
    if (err) {
        console.log(err);
    } else {
        console.log("Server is running on port 4050");
    }
});