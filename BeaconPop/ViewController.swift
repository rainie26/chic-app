//
//  ViewController.swift
//  BeaconPop
//
//  Created by Gabriel Theodoropoulos on 10/3/15.
//  Copyright (c) 2015 Appcoda. All rights reserved.
//

import UIKit
import QuartzCore
import CoreLocation
import CoreBluetooth


class ViewController: UIViewController {

    @IBOutlet weak var btnAction: UIButton!
    
    @IBOutlet weak var lblStatus: UILabel!
    
    @IBOutlet weak var lblBTStatus: UILabel!
    
    @IBOutlet weak var txtMajor: UITextField!
    
    @IBOutlet weak var txtMinor: UITextField!
    
    let uuid = NSUUID(UUIDString: "22617E90-0F30-41B2-9F2B-A49146F77567")
    
    var beaconRegion: CLBeaconRegion!
    
    var bluetoothPeripheralManager: CBPeripheralManager!
    
    var isBroadcasting = false
    
    var dataDictionary = NSDictionary()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
        
        btnAction.layer.cornerRadius = btnAction.frame.size.width / 2
        
        let swipeDownGestureRecognizer = UISwipeGestureRecognizer(target: self, action: "handleSwipeGestureRecognizer:")
        swipeDownGestureRecognizer.direction = UISwipeGestureRecognizerDirection.Down
        view.addGestureRecognizer(swipeDownGestureRecognizer)
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }

    
    // MARK: Custom method implementation
    
    func handleSwipeGestureRecognizer(gestureRecognizer: UISwipeGestureRecognizer) {
        txtMajor.resignFirstResponder()
        txtMinor.resignFirstResponder()
    }
    
    
    // MARK: IBAction method implementation
    
    @IBAction func switchBroadcastingState(sender: AnyObject) {
        if !isBroadcasting {
            if bluetoothPeripheralManager.state == CBPeripheralManagerState.PoweredOn {
//                let major: CLBeaconMajorValue = UInt16(txtMajor.text.toInt()!)
//                let minor: CLBeaconMinorValue = UInt16(txtMinor.text.toInt()!)
//                beaconRegion = CLBeaconRegion(proximityUUID: uuid, major: major, minor: minor, identifier: "com.appcoda.beacondemo")
//                dataDictionary = beaconRegion.peripheralDataWithMeasuredPower(nil)
//                bluetoothPeripheralManager.startAdvertising(dataDictionary)
//                btnAction.setTitle("Stop", forState: UIControlState.Normal)
//                lblStatus.text = "Broadcasting..."
//                
//                txtMajor.enabled = false
//                txtMinor.enabled = false
//                
//                isBroadcasting = true
                
            }
        }
        else {
//            bluetoothPeripheralManager.stopAdvertising()
//            
//            btnAction.setTitle("Start", forState: UIControlState.Normal)
//            lblStatus.text = "Stopped"
//            
//            txtMajor.enabled = true
//            txtMinor.enabled = true
//            
//            isBroadcasting = false
        }
    }
    
}

